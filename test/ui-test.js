var tape = require("tape"),
    ui = require("../");

tape("ui() returns the answer to the ultimate question of life, the universe, and everything.", function(test) {
  test.equal(ui.ui(), 42);
  test.end();
});
