module.exports = {
  devServer: {
    proxy: "https://localhost:8080",
  },
  publicPath:
    process.env.NODE_ENV === "production" ? "/calculadora-presupuesto/" : "/",
};
