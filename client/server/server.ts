import createServer from './createServer';
import { connect, ConnectOptions } from 'mongoose';
const app = createServer();

const MONGO_URI =
  'mongodb+srv://dbUser:codesmith@cluster0.drsef.mongodb.net/saamsa?retryWrites=true&w=majority';
connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'saamsa',
} as ConnectOptions)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3001, () => console.log('server listening on port 3001 :)'));
  })
  .catch((err: Error) =>
    console.log(`Error found inside the mongoose connect method: ${err}`)
  );
