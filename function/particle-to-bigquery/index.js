const { BigQuery } = require("@google-cloud/bigquery");

const bigQuery = new BigQuery({
  projectId: process.env.projectId,
});

/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {object} pubSubEvent The event payload.
 * @param {object} context The event metadata.
 */
exports.handler = (pubSubEvent, context) => {
  console.log(pubSubEvent);
  console.log(context);
  const data = JSON.parse(Buffer.from(pubSubEvent.data, "base64").toString());
  const items = data.l.flatMap(({ t: time, d: dataObject }) =>
    Object.entries(dataObject).map(([eventName, eventValue]) => ({
        vehicle: data.v,
        event: eventName,
        data: eventValue,
        published_at: bigQuery.datetime(new Date(pubSubEvent.attributes.published_at).toISOString()),
        recorded_at: bigQuery.datetime(new Date(time * 1000).toISOString())
     }))
  );
  bigQuery
    .dataset(process.env.datasetName)
    .table(process.env.tableName)
    .insert(items)
    .then(() => {
      console.log("Events successfully stored in BigQuery!");
    })
    .catch((err) => {
      console.log("There was an error storing the event:", err);
    });
};
