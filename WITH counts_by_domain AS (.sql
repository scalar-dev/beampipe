WITH counts_by_domain AS (
    SELECT domain, count(*) AS domain_count FROM event
    WHERE (now() - event.time) < '28 days' GROUP BY domain
),
domain_lists  AS (
    SELECT account_id, array_agg(domain) domains FROM domain
    GROUP BY account_id
),
account_counts AS (
    SELECT account_id, sum(counts_by_domain.domain_count) page_views 
    FROM domain 
    LEFT JOIN counts_by_domain ON domain.domain = counts_by_domain.domain
    GROUP BY account_id
)
SELECT name, email, id, account_counts.page_views, domain_lists.domains, (now() - account.created_at) account_age, (now() - account.last_login_at) last_login 
FROM account
LEFT JOIN account_counts ON account_counts.account_id = id
LEFT JOIN domain_lists ON domain_lists.account_id = id;
