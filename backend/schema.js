const zod = require("zod");

const schema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(8).max(16),
});

module.exports = schema;
