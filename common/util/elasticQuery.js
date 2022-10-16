import moment from "moment-timezone";
import { logger } from "../../config/winston.js";

const metricSearchQuery = () => {
  const queryData = {
    body: {
      query: {
        bool: {
          filter: {
            bool: {
              must: [
                {
                  range: {
                    "@timestamp": {
                      gt: `${moment().subtract(3, "m").toISOString(true)}`,
                      lte: `${moment().toISOString(true)}`,
                    },
                  },
                },
              ],
            },
          },
        },
      },
      aggs: {
        getHostName: {
          terms: {
            field: "host.hostname",
            size: 999,
          },
          aggs: {
            getIP: {
              terms: {
                field: "host.ip",
                size: 999,
              },
            },
          },
        },
      },
      size: 0,
    },
  };
  return queryData;
};

const heartSearchQuery = () => {
  const queryData = {
    query: {
      bool: {
        filter: {
          bool: {
            must: [
              {
                range: {
                  "@timestamp": {
                    gt: `${moment().subtract(3, "m").toISOString(true)}`,
                    lte: `${moment().toISOString(true)}`,
                  },
                },
              },
            ],
          },
        },
      },
    },
    aggs: {
      getStatus: {
        terms: {
          field: "summary.up",
          size: 999,
        },
        aggs: {
          getName: {
            terms: {
              field: "agent.hostname",
              size: 999,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              getPort: {
                terms: {
                  field: "url.port",
                  size: 999,
                },
              },
            },
          },
        },
      },
    },
    size: 0,
  };

  return queryData;
};

const heartHostNameQuery = () => {
  const queryData = {
    query: {
      bool: {
        filter: {
          bool: {
            must: [
              {
                range: {
                  "@timestamp": {
                    gt: `${moment().subtract(3, "m").toISOString(true)}`,
                    lte: `${moment().toISOString(true)}`,
                  },
                },
              },
            ],
          },
        },
      },
    },
    aggs: {
      getHostName: {
        terms: {
          field: "observer.hostname",
          size: 999,
        },
      },
    },
    size: 0,
  };

  return queryData;
};

export { metricSearchQuery, heartSearchQuery, heartHostNameQuery };
