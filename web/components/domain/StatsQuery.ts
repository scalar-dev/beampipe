import gql from "graphql-tag";

export const StatsQuery = gql`
  query stats(
    $domain: String!
    $bucketDuration: String!
    $uniqueBucketDuration: String!
    $timePeriod: TimePeriodInput!
  ) {
    events(domain: $domain, timePeriod: $timePeriod) {
      bucketed(bucketDuration: $bucketDuration) {
        time
        count
      }

      bucketedUnique(bucketDuration: $uniqueBucketDuration) {
        time
        count
      }

      topPages {
        key
        count
      }

      topSources {
        referrer
        source
        count
      }

      topScreenSizes {
        key
        count
      }

      topCountries {
        key
        count
        data
      }

      topDevices {
        key
        count
      }

      topDeviceClasses {
        key
        count
      }

      topOperatingSystems {
        key
        count
      }

      topAgents {
        key
        count
      }

      goals {
        key
        count
      }

      countUnique
      previousCountUnique
      count
      previousCount
      bounceCount
      previousBounceCount
    }
  }
`;