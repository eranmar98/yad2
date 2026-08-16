import { Router } from 'express';
import InquiryController from '../controllers/inquiry';
import auth from '../middleware/auth';

const router = Router();

router.post('/', auth, InquiryController.createInquiry);
router.get('/mine', auth, InquiryController.getMyInquiries);
router.get('/received', auth, InquiryController.getReceivedInquiries);

export default router;
