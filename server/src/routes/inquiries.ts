import { Router } from 'express';
import InquiryController from '../controllers/inquiry';
import auth from '../middleware/auth';

const router = Router();

router.post('/', auth, InquiryController.createInquiry);
router.get('/mine', auth, InquiryController.getMyInquiries);
router.get('/received', auth, InquiryController.getReceivedInquiries);
router.get('/conversations', auth, InquiryController.getConversations);
router.get('/:id/messages', auth, InquiryController.getThread);
router.post('/:id/messages', auth, InquiryController.sendMessage);

export default router;
