import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();
router.post(
  "/create-account",
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña es demasiado corta, mínimo 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (req.body.password !== value) {
      throw new Error("Las contraseñas no coinciden");
    }
    return true;
  }),
  body("email").isEmail().withMessage("El correo electrónico no es válido"),
  handleInputErrors,
  AuthController.createAccount,
);

router.post(
  "/confirm-account",
  body("token").notEmpty().withMessage("El token es obligatorio"),
  handleInputErrors,
  AuthController.confirmAccount,
);

router.post(
  "/login",
  body("email").isEmail().withMessage("El correo electrónico no es válido"),
  body("password").notEmpty().withMessage("La contraseña no debe estar vacía"),
  handleInputErrors,
  AuthController.login,
);

router.post(
  "/request-code",
  body("email").isEmail().withMessage("El correo electrónico no es válido"),
  handleInputErrors,
  AuthController.requestConfirmAccount,
);

router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("El correo electrónico no es válido"),
  handleInputErrors,
  AuthController.forgotPassword,
);

router.post(
  "/validate-token",
  body("token").notEmpty().withMessage("El token es obligatorio"),
  handleInputErrors,
  AuthController.validateToken,
);

router.post(
  "/update-password/:token",
  param("token").isNumeric().withMessage("El token no es válido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña es demasiado corta, mínimo 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (req.body.password !== value) {
      throw new Error("Las contraseñas no coinciden");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updatePassword,
);

router.get("/user", authenticate, AuthController.user);
router.get("/user/:userId",
    param("userId").isMongoId().withMessage("El id del usuario es obligatorio"),
    AuthController.getUserById
)

router.put('/profile',
    authenticate,
    body("name").notEmpty().withMessage("El nombre de la tarea es obligatorio"),
    body("email").notEmpty().withMessage("El email de la tarea es obligatorio"),
    handleInputErrors,
    AuthController.updateProfile
)
router.post('/update-password',
    authenticate,
    body("current_password").notEmpty().withMessage("La contraseña no debe estar vacía"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("La contraseña es demasiado corta, mínimo 8 caracteres"),
    body("password_confirmation").custom((value, { req }) => {
        if (req.body.password !== value) {
            throw new Error("Las contraseñas no coinciden");
        }
        return true;
    }),
    handleInputErrors,
    AuthController.updateUserPassword
)
router.post('/check-password',
    authenticate,
    body("password").notEmpty().withMessage("La contraseña no debe estar vacía"),
    handleInputErrors,
    AuthController.checkPassword
)
export default router;
