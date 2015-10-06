import {Router} from 'express';
import loginHandler from './routes/login';
import registerHandler from './routes/register';

const api = Router();

api.use((req, res, next) => {
  if (Object.keys(req.body).length > 0) {
    for (const key in req.body) {
      if (req.body.hasOwnProperty(key) && req.body[key].length === 0) {
        res.status(400).json({
          message: `Value for "${key}" cannot be empty.`,
        });
        return;
      }
    }
  } else {
    res.status(400).json({
      message: 'Request cannot be empty.',
    });
    return;
  }
  next();
});

api.post('/login', loginHandler);
api.post('/register', registerHandler);

export default api;
