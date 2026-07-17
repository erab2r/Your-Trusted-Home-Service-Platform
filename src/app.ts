import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  Application,
  Request,
  Response,
} from "express";

import config from "./config";

import { adminRoutes } from "./modules/admin/admin.route";
import { authRoutes } from "./modules/auth/auth.route";
import { userRoutes } from "./modules/user/user.route";
import { technicianRoutes } from "./modules/technician/technician.route";
import { categoryRoutes } from "./modules/category/category.route";
import { serviceRoutes } from "./modules/service/service.route";
import { availabilityRoutes } from "./modules/availability/availability.route";
import { bookingRoutes } from "./modules/booking/booking.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { reviewRoutes } from "./modules/review/review.route";
import { paymentService } from "./modules/payment/payment.service";

import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  })
);

app.use(
  "/api/payments/webhook",
  express.raw({
    type: "application/json",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World! V2");
});


app.get(
  "/payment/success",
  async (req: Request, res: Response) => {
    const { bookingId, session_id } = req.query;

    if (typeof session_id === "string") {
      try {
        const verification =
          await paymentService.verifyCheckoutSession(
            session_id
          );

        return res.status(200).json({
          success: true,
          message:
            "Payment success route reached and payment verification attempted.",
          data: {
            bookingId,
            verification,
          },
        });
      } catch (error) {
        return res.status(200).json({
          success: false,
          message:
            "Payment success route reached, but verification failed. Check webhook or verify-session API.",
          data: {
            bookingId,
            sessionId: session_id,
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      message:
        "Payment success route reached. Missing session_id, so payment was not verified from this route.",
      data: {
        bookingId,
      },
    });
  }
);

app.get(
  "/payment/cancel",
  async (req: Request, res: Response) => {
    const { bookingId, session_id } = req.query;

    if (typeof session_id === "string") {
      try {
        const verification =
          await paymentService.cancelCheckoutSession(
            session_id
          );

        return res.status(200).json({
          success: false,
          message:
            "Payment cancelled and status synchronization attempted.",
          data: {
            bookingId,
            verification,
          },
        });
      } catch (error) {
        return res.status(200).json({
          success: false,
          message:
            "Payment cancelled route reached, but status synchronization failed.",
          data: {
            bookingId,
            sessionId: session_id,
          },
        });
      }
    }

    res.status(200).json({
      success: false,
      message:
        "Payment cancelled route reached. Missing session_id, so payment was not synchronized from this route.",
      data: {
        bookingId,
      },
    });
  }
);


app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availabilities", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);

app.use(globalErrorHandler);

export default app;









































