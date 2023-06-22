module.exports = (err, req, res, next) => {
  console.log('in Error Controller ');
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};

// module.exports = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   const sendErrorDev = (err, res) => {
//     return res.status(err.statusCode).json({
//       status: err.status,
//       error: err,
//       message: err.message,
//       stack: err.stack
//     });
//   };

//   const sendErrorProd = (err, res) => {
//     if (err.isOperational) {
//       res.status(err.statusCode).json({
//         status: err.status,
//         message: err.message
//       });
//     } else {
//       // 1.) log Error
//       console.log('error', err);

//       // 2.) Send Geniric Message
//       res.status(500).json({
//         status: 'Error',
//         message: 'Something went Very Wrong!'
//       });
//     }

//     if (process.env.NODE_ENV === 'development') {
//       sendErrorDev(err, res);
//     } else if (process.env.NODE_ENV === 'production') {
//       sendErrorProd(err, res);
//     }
//   };
// };
