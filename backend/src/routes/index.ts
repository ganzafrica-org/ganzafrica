import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import projectRoutes from "./project.routes";
import categoryRoutes from "./categories";
import roleRoutes from "./roles.routes";
import teamRoutes from "./teams.routes";
import teamTypeRoutes from "./team-types.routes";
import partenerRoutes from "./partner.routes";
import testimonialRoutes from "./testimonial.routes";
import faqRoutes from "./faqs";
import newsRourtes from "./news.routes";
import opportunityRoutes from "./opportunity";
<<<<<<< HEAD
import applicationRoutes from "./application";
import contactRoutes from "./contact";
import  newsletterRouter  from "./newsletter";

=======
import contactRoutes from "./contact";
import  newsletterRouter  from "./newsletter";
>>>>>>> 46d65ae8005e640e916d5e7763a93c568731decc

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/categories", categoryRoutes);
router.use("/roles", roleRoutes);
router.use("/teams", teamRoutes);
router.use("/team-types", teamTypeRoutes);
router.use("/partners", partenerRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/faqs", faqRoutes);
router.use("/news", newsRourtes);
router.use("/opportunities", opportunityRoutes);
<<<<<<< HEAD
router.use("/applications", applicationRoutes); 
=======
>>>>>>> 46d65ae8005e640e916d5e7763a93c568731decc
router.use("/applications", opportunityRoutes);
router.use("/contacts", contactRoutes);
router.use("/newsletter", newsletterRouter);



export default router;