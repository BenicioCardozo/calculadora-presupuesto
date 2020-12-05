module.exports = {
  configureWebpack: {
    devServer: {
      headers: { "Access-Control-Allow-Origin": "*" },
    },
  },
  publicPath:
    process.env.NODE_ENV === "production" ? "/calculadora-presupuesto/" : "/",
};
