#!/bin/bash
set -euo pipefail

KUBECONFIG="kubeconfig-k8s-condescending-murdock.yaml"
NAMESPACE="alysis"
DUMP_FILE="beampipe-final.dump"

# Railway connection details - fill these in
RAILWAY_HOST="switchyard.proxy.rlwy.net"
RAILWAY_PORT="23375"
RAILWAY_USER="railway"
RAILWAY_DB="railway"

# Step 1: Get the running postgres pod
echo "=== Step 1: Finding running postgres pod ==="
POD=$(KUBECONFIG=$KUBECONFIG kubectl get pods -n $NAMESPACE -l app=postgres --field-selector=status.phase=Running -o jsonpath='{.items[0].metadata.name}')
if [ -z "$POD" ]; then
    echo "ERROR: No running postgres pod found. Wait for it to start and try again."
    exit 1
fi
echo "Found pod: $POD"

# Step 2: Dump inside the pod
echo "=== Step 2: Running pg_dump inside pod ==="
KUBECONFIG=$KUBECONFIG kubectl exec -n $NAMESPACE $POD -- pg_dump -U postgres -Fc --no-owner --no-acl -f /tmp/beampipe.dump postgres
echo "Dump completed inside pod"

# Step 3: Copy dump out
echo "=== Step 3: Copying dump file from pod ==="
KUBECONFIG=$KUBECONFIG kubectl cp $NAMESPACE/$POD:/tmp/beampipe.dump $DUMP_FILE
echo "Dump copied: $(ls -lh $DUMP_FILE)"

# Step 3b: Validate dump file
echo "=== Step 3b: Validating dump file ==="
DUMP_SIZE=$(stat -f%z "$DUMP_FILE" 2>/dev/null || stat -c%s "$DUMP_FILE")
if [ "$DUMP_SIZE" -lt 1000000 ]; then
    echo "ERROR: Dump file is only $(( DUMP_SIZE / 1024 ))KB — likely incomplete. Aborting."
    exit 1
fi
echo "Dump size: $(( DUMP_SIZE / 1024 / 1024 ))MB"

# Check TOC is readable and contains expected tables
TOC_OUTPUT=$(pg_restore -l "$DUMP_FILE" 2>&1)
TOC_EXIT=$?
if [ $TOC_EXIT -ne 0 ]; then
    echo "ERROR: pg_restore -l failed — dump file may be corrupt."
    exit 1
fi

EXPECTED_TABLES="account domain event flyway_schema_history goal reset_token slack_subscription"
for table in $EXPECTED_TABLES; do
    if ! echo "$TOC_OUTPUT" | grep -q "TABLE DATA public $table"; then
        echo "ERROR: Table '$table' not found in dump TOC. Dump may be incomplete."
        exit 1
    fi
done
echo "TOC valid — all expected tables present"

# Check that hypertable chunks are present (event data lives in these)
CHUNK_COUNT=$(echo "$TOC_OUTPUT" | grep -c "_hyper_" || true)
if [ "$CHUNK_COUNT" -lt 100 ]; then
    echo "WARNING: Only $CHUNK_COUNT hypertable chunks found (expected ~200). Dump may be incomplete."
    read -p "Continue anyway? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then exit 1; fi
else
    echo "Found $CHUNK_COUNT hypertable chunks"
fi

# Step 4: Restore to Railway
echo ""
echo "=== Step 4: Restoring to Railway ==="
echo "Enter Railway PGPASSWORD:"
read -s RAILWAY_PW
export PGPASSWORD=$RAILWAY_PW

echo "Running timescaledb_pre_restore()..."
psql -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DB -c "SELECT timescaledb_pre_restore();"

echo "Restoring dump..."
pg_restore -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DB \
    --no-owner --no-acl $DUMP_FILE 2>&1 | tail -5 || true

echo "Running timescaledb_post_restore()..."
psql -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DB -c "SELECT timescaledb_post_restore();"

# Step 5: Verify
echo ""
echo "=== Step 5: Verification ==="
psql -h $RAILWAY_HOST -p $RAILWAY_PORT -U $RAILWAY_USER -d $RAILWAY_DB -c "
    SELECT 'account' as tbl, count(*) FROM account
    UNION ALL SELECT 'domain', count(*) FROM domain
    UNION ALL SELECT 'event', count(*) FROM event
    UNION ALL SELECT 'goal', count(*) FROM goal
    UNION ALL SELECT 'flyway', count(*) FROM flyway_schema_history
    ORDER BY tbl;
"

unset PGPASSWORD
echo ""
echo "=== Migration complete ==="
echo "Don't forget to:"
echo "  - Verify the app works at https://app.beampipe.io"
echo "  - Disable public networking on Railway TimescaleDB"
echo "  - Clean up: rm $DUMP_FILE"
