module.exports = function(req, res) {
  res.json({
    success: true,
    data: {
      key: 'value of js',
    },
  });
};
