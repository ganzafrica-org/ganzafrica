import { Request, Response } from "express";
import * as documentCategoryTemplateService from "../../services/hr/document-category-template.service";

export const listDocumentCategoryTemplates = async (req: Request, res: Response) => {
  const templates = await documentCategoryTemplateService.listDocumentCategoryTemplates();
  res.json({ success: true, data: templates });
};

export const getDocumentCategoryTemplate = async (req: Request, res: Response) => {
  const template = await documentCategoryTemplateService.getDocumentCategoryTemplate(req.params.id);
  res.json({ success: true, data: template });
};

export const createDocumentCategoryTemplate = async (req: Request, res: Response) => {
  const template = await documentCategoryTemplateService.createDocumentCategoryTemplate(req.body);
  res.status(201).json({ success: true, data: template });
};

export const updateDocumentCategoryTemplate = async (req: Request, res: Response) => {
  const template = await documentCategoryTemplateService.updateDocumentCategoryTemplate(
    req.params.id,
    req.body,
  );
  res.json({ success: true, data: template });
};

export const deleteDocumentCategoryTemplate = async (req: Request, res: Response) => {
  await documentCategoryTemplateService.deleteDocumentCategoryTemplate(req.params.id);
  res.json({ success: true, message: "Category template deleted successfully" });
};
