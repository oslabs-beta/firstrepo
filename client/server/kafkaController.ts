import * as express from 'express';
import * as kafka from 'kafkajs';
interface controller {
  refresh: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void;
  getInitial: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void;
}
//holds messages from kafka consumer, currently globally scoped so refresh route has access to all consumercache
//TODO finagle this so that its not a dirty global
const consumerCache: { value: number; time: number }[] = [];

const controller: controller = {
  getInitial: function (req, res) {
    const instance = new kafka.Kafka({
      clientId: 'testing2',
      brokers: ['adams-mbp:9092'], //need to change this if you want to get kafka functionality
    });
    //creates new consumer then connects it then runs from last held offset, processes message and saves them in consumer cache
    const consumer = instance.consumer({ groupId: 'consumerTest' });
    consumer
      .connect()
      .then(() => {
        //consumer remembers offset because of consumer groupId, so this fromBeginning not working perfectly, need to manually add offset = 0 if we want to access beginning
        consumer.subscribe({ topic: 'testing-topic', fromBeginning: true });
      })
      .then(() => {
        consumer.run({
          eachMessage: async (e) => {
            //e has partition on it!!!!!
            const { message } = e;
            const splitArr = message!.value!.toString().split('@');
            if (splitArr.length === 2) {
              const value = Number(splitArr[0]);
              const time = Number(splitArr[1]) - 163300000;
              consumerCache.push({ value, time });
              //just for this implementation of line graph, not needed for count-based-figures/maps
              consumerCache.sort(
                (a: { time: number }, b: { time: number }) => a.time - b.time
              );
            }
          },
        });
      })
      .then(() => {
        if (consumerCache.length) {
          res.status(200).json(consumerCache);
        } else {
          res.status(200).json([
            { time: 0, value: 0 },
            { time: 1, value: 1 },
          ]);
        }
      });
  },
  refresh: function (req, res) {
    if (consumerCache.length) {
      res.status(200).json(consumerCache);
    } else {
      res.status(200).json([
        { value: 0, time: 0 },
        { value: 1, time: 1 },
      ]);
    }
  },
};

export default controller;