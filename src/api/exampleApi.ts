import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * path:
 *  /api/v1/test-route/{username}:
 *    post:
 *      summary: Example description
 *      tags: [Example]
 *      parameters:
 *        - in: path
 *          name: username
 *          schema:
 *            type: string
 *          required: true
 *          description: example of parameter
 *      responses:
 *        200:
 *          description: abc
 *        400:
 *          description: cde
 */
router.get('/test-route/:username', async (req, res) => {
  const { username } = req.params;
  console.log(username);
  res.send({ username });
});

export default router;
