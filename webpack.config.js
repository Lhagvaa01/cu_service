// module.exports = {
//     module: {
//       rules: [
//         {
//           test: /\.js$/,
//           enforce: "pre",
//           use: ["source-map-loader"],
//           exclude: [/node_modules\/web-vitals/],
//         },
//       ],
//     },
//   };
  
const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-transform-runtime"],
          },
        },
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
        exclude: [/node_modules\/web-vitals/],
      },
    ],
  },
  resolve: {
    alias: {
      "@babel/runtime": path.resolve(__dirname, "node_modules/@babel/runtime"),
    },
  },
};
