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

      if (!Types.ObjectId.isValid(itemId)) {
        res.status(404).json({ error: 'Item not found' });
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

      const inquiry: IInquiry = await InquiryServices.startConversation(
        new Types.ObjectId(itemId),
        new Types.ObjectId(authReq.user!._id),
        String(message).trim(),
      );
      res.status(201).json(inquiry);
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
  static async getConversations(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const conversations = await InquiryServices.getConversations(
        new Types.ObjectId(authReq.user!._id),
      );
      res.status(200).json(conversations);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      res.status(500).json({ error: message });
    }
  }

  static async getThread(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = String(req.params.id);
      const thread = Types.ObjectId.isValid(id)
        ? await InquiryServices.getThread(id, new Types.ObjectId(authReq.user!._id))
        : null;

      if (!thread) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }
      res.status(200).json(thread);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      res.status(500).json({ error: message });
    }
  }

  static async sendMessage(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = String(req.params.id);
      const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';

      if (!text) {
        res.status(400).json({ error: 'text is required' });
        return;
      }
      if (text.length > 2000) {
        res.status(400).json({ error: 'Message is too long' });
        return;
      }

      const sent = Types.ObjectId.isValid(id)
        ? await InquiryServices.sendMessage(id, new Types.ObjectId(authReq.user!._id), text)
        : null;

      if (!sent) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }
      res.status(201).json(sent);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      res.status(500).json({ error: message });
    }
  }
}

export default InquiryController;
