"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    text: "",
    color: "",
  });
  const [passwordMatch, setPasswordMatch] = useState({
    isMatching: false,
    message: "",
  });
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpiar errores cuando el usuario comience a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Validar coincidencia de contraseñas en tiempo real
    if (
      name === "confirmPassword" ||
      (name === "password" && formData.confirmPassword)
    ) {
      const password = name === "password" ? value : formData.password;
      const confirmation =
        name === "confirmPassword" ? value : formData.confirmPassword;

      if (password === confirmation && password !== "") {
        setPasswordMatch({
          isMatching: true,
          message: "¡Las contraseñas coinciden!",
        });
      } else if (confirmation !== "") {
        setPasswordMatch({
          isMatching: false,
          message: "Las contraseñas no coinciden",
        });
      } else {
        setPasswordMatch({
          isMatching: false,
          message: "",
        });
      }
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: "", color: "", width: "0%" };

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    if (isLongEnough && hasLetter && hasNumber && hasSpecialChar) {
      return {
        strength: 3,
        text: "Fuerte",
        color: "bg-blue-500",
        textColor: "text-blue-500",
        width: "100%",
      };
    } else if (isLongEnough && hasLetter && hasNumber) {
      return {
        strength: 2,
        text: "Regular",
        color: "bg-amber-500",
        textColor: "text-amber-500",
        width: "66%",
      };
    } else if (password.length > 0) {
      return {
        strength: 1,
        text: "Débil",
        color: "bg-red-500",
        textColor: "text-red-500",
        width: "33%",
      };
    }

    return {
      strength: 0,
      text: "",
      color: "",
      textColor: "",
      width: "0%",
    };
  };

  // Actualizar la fortaleza de la contraseña cuando cambie
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(formData.password));
  }, [formData.password]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }

    // Validar email
    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no tiene un formato válido";
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "La contraseña debe contener al menos una letra y un número";
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    // Validar términos
    if (!formData.termsAccepted) {
      newErrors.terms = "Debes aceptar los términos y condiciones";
    }

    return newErrors;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log("URL de la API:", apiUrl); // Debug

      const registerData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: "bartender",
      };
      console.log("Datos a enviar:", registerData); // Debug

      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(registerData),
      });

      console.log("Status de la respuesta:", response.status); // Debug
      console.log(
        "Headers de la respuesta:",
        Object.fromEntries(response.headers.entries())
      ); // Debug

      // Intentar leer la respuesta como texto primero
      const responseText = await response.text();
      console.log("Respuesta como texto:", responseText); // Debug

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error al parsear la respuesta:", parseError);
        throw new Error("La respuesta del servidor no es JSON válido");
      }

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar usuario");
      }
      toast({
        title: "¡Cuenta creada!",
        description:
          "Tu cuenta ha sido creada exitosamente. Por favor, inicia sesión.",
      });

      // Redirigir al login después de un breve retraso
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Error completo:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al registrar usuario. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-background/75 rounded-2xl shadow-2xl border dark:border-primary p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 group">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <img
                src="/logo_oficial.png"
                alt="Brewsy Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            Crea tu cuenta
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Únete a nuestro equipo y comienza a gestionar tu negocio
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Nombre completo */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nombre completo
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Juan Pérez"
              className={`h-12 text-base border-gray-300 dark:border-gray-600 focus:border-amber-500 focus:ring-amber-500 ${
                errors.name ? "border-red-500" : ""
              }`}
              required
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Correo electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nombre@ejemplo.com"
              className={`h-12 text-base border-gray-300 dark:border-gray-600 focus:border-amber-500 focus:ring-amber-500 ${
                errors.email ? "border-red-500" : ""
              }`}
              required
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`h-12 text-base pr-12 border-gray-300 dark:border-gray-600 focus:border-amber-500 focus:ring-amber-500 ${
                  errors.password ? "border-red-500" : ""
                }`}
                placeholder="Crea una contraseña segura"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.password}
              </p>
            )}
            {formData.password && !errors.password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        getPasswordStrength(formData.password).color
                      }`}
                      style={{
                        width: getPasswordStrength(formData.password).width,
                      }}
                    />
                  </div>
                </div>
                <p
                  className={`text-sm ${
                    getPasswordStrength(formData.password).textColor
                  }`}
                >
                  {getPasswordStrength(formData.password).text}
                </p>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`h-12 text-base pr-12 border-gray-300 dark:border-gray-600 focus:border-amber-500 focus:ring-amber-500 ${
                  errors.confirmPassword ? "border-red-500" : ""
                }`}
                placeholder="Repite tu contraseña"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
            </div>
            {formData.confirmPassword && passwordMatch.message && (
              <p
                className={`text-sm flex items-center gap-1 ${
                  passwordMatch.isMatching ? "text-blue-500" : "text-red-500"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                {passwordMatch.message}
              </p>
            )}
          </div>

          {/* Términos y condiciones */}
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) =>
                handleChange({
                  target: {
                    name: "termsAccepted",
                    checked: checked as boolean,
                    type: "checkbox",
                  },
                } as any)
              }
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Acepto los términos y condiciones
              </label>
              {errors.terms && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.terms}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>

        {/* Enlace a login */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
