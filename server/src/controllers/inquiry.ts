import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { IInquiry } from '../models/inquiry';
import InquiryServices from '../services/inquiryServices';
import ItemServices from '../services/itemServices';

type AuthenticatedRequest = Request & {
  user?: {
    _id: string;
  };
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Unknown error';
}

class InquiryController {
  static async createInquiry(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const { itemId, message } = req.body;

      if (!itemId || !message) {
        res.status(400).json({ error: 'itemId and message are required' });
        return;
      }

      const item = await ItemServices.getItemById(itemId);
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }

      if (String(item.sellerId) === String(authReq.user!._id)) {
        res.status(400).json({ error: 'You cannot contact yourself about your own item' });
        return;
      }

      const newInquiry: IInquiry = await InquiryServices.createInquiry({
        itemId: new Types.ObjectId(itemId),
        message,
        userId: new Types.ObjectId(authReq.user!._id),
      });
      res.status(201).json(newInquiry);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      res.status(500).json({ error: message });
    }
  }

  static async getMyInquiries(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const inquiries: IInquiry[] = await InquiryServices.getInquiriesByUser(
        new Types.ObjectId(authReq.user!._id),
      );
      res.status(200).json(inquiries);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      res.status(500).json({ error: message });
    }
  }

  static async getReceivedInquiries(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const inquiries: IInquiry[] = await InquiryServices.getInquiriesForSeller(
        new Types.ObjectId(authReq.user!._id),
      );
      res.status(200).json(inquiries);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      res.status(500).json({ error: message });
    }
  }
}

export default InquiryController;
