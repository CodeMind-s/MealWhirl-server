const kafka = require('kafka-node');
const Producer = kafka.Producer;
const KafkaClient = kafka.KafkaClient;

const initKafkaProducer = () => {
  return new Promise((resolve, reject) => {
    try {
      const client = new KafkaClient({ 
        kafkaHost: process.env.KAFKA_BROKER || 'kafka:9092'
      });

      const producer = new Producer(client);

      producer.on('ready', () => {
        console.log('Kafka Producer is ready');
        resolve(producer);
      });

      producer.on('error', (err) => {
        console.error('Kafka Producer initialization error:', err);
        reject(err);
      });
    } catch (error) {
      console.error('Error creating Kafka client:', error);
      reject(error);
    }
  });
};

const sendKafkaMessage = (topic, message) => {
  return new Promise((resolve, reject) => {
    const client = new KafkaClient({ 
      kafkaHost: process.env.KAFKA_BROKER || 'kafka:9092'
    });
    const producer = new Producer(client);

    producer.on('ready', () => {
      const payloads = [{ 
        topic, 
        messages: JSON.stringify(message) 
      }];

      producer.send(payloads, (err, data) => {
        if (err) {
          console.error('Kafka send error:', err);
          reject(err);
        } else {
          console.log('Kafka message sent:', data);
          resolve(data);
        }
      });
    });

    producer.on('error', (err) => {
      console.error('Kafka Producer error:', err);
      reject(err);
    });
  });
};

module.exports = { 
  initKafkaProducer, 
  sendKafkaMessage 
};