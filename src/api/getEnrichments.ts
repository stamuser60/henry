import { Router } from 'express';
import { getEnrichments } from '../app/getEnrichment';
import { incidentRepo } from '../compositionRoot';
import { AppError } from '../core/exc';

const router = Router();

/**
 * @swagger
 *  components:
 *    schemas:
 *      Alert:
 *        type: object
 *        required:
 *          - timestampStart
 *          - timestampUpdate
 *          - severity
 *          - operator
 *          - node
 *          - object
 *          - description
 *          - application
 *          - origin
 *          - key
 *        properties:
 *          origin:
 *            type: string
 *            description: name of the source from where the enrichment is sent
 *          timestampStart:
 *            type: string
 *            format: date-time
 *            description: string representing the timestamp that the alert was opened
 *          timestampUpdate:
 *            type: string
 *            format: date-time
 *            description: string representing the timestamp that the alert was updated
 *          node:
 *            type: string
 *            description: relevant node to the alert
 *          description:
 *            type: string
 *            description: the description of the alert
 *          severity:
 *            type: string
 *            enum: [normal, warning, minor, major, critical]
 *          object:
 *            type: string
 *            description: relevant object to the alert
 *          application:
 *            type: string
 *            description: relevant application to the alert
 *          operator:
 *            type: string
 *            description: relevant operator to the alert
 *          key:
 *            type: string
 *            description: unique string that represents the type of the alert
 *      HermeticityIncident:
 *        type: object
 *        required:
 *          - timestampStart
 *          - timestampUpdate
 *          - severity
 *          - origin
 *          - status
 *          - value
 *          - beakID
 *          - hasAlert
 *        properties:
 *          origin:
 *            type: string
 *            description: name of the source from where the enrichment is sent
 *          timestampStart:
 *            type: string
 *            format: date-time
 *            description: string representing the timestamp that the hermeticity was opened
 *          timestampUpdate:
 *            type: string
 *            format: date-time
 *            description: string representing the timestamp that the hermeticity was updated
 *          status:
 *            type: string
 *            enum: [normal, minor, critical]
 *          value:
 *            type: integer
 *            minimum: 0
 *            maximum: 100
 *            description: the value of the hermeticity, in percentage
 *          beakID:
 *            type: string
 *            description: a unique beak id which the hermeticity is related to
 *          hasAlert:
 *            type: boolean
 *            description: if true, then there is an alert on that beak, else there is none
 *      allEnrichmentsResponse:
 *        type: object
 *        properties:
 *          alert:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/Alert'
 *          hermeticity:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/HermeticityIncident'
 */

/**
 * @swagger
 * path:
 *  /api/v1/enrichments:
 *    get:
 *      summary: Get all current enrichments
 *      tags: [Incident]
 *      responses:
 *        '200':
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/allEnrichmentsResponse'
 *        500:
 *          description: Internal server error
 */
router.get('/enrichments', async (req, res) => {
  /**
   * Returns all current open incidents.
   */
  try {
    const enrichments = await getEnrichments(incidentRepo);
    res.send(enrichments).status(200);
  } catch (e) {
    if (e instanceof AppError) {
      res.status(e.status).send(e);
    } else {
      res.status(500).send(e);
    }
  }
});

export default router;
