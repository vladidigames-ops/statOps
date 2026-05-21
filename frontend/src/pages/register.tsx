import { Anchor, Button, Container, Paper, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRegister } from "@refinedev/core";
import { Link } from "react-router-dom";

interface RegisterValues {
  email: string;
  password: string;
  full_name: string;
  account_name: string;
}

export function RegisterPage() {
  const { mutate: register, isLoading } = useRegister<RegisterValues>();
  const form = useForm<RegisterValues>({
    initialValues: { email: "", password: "", full_name: "", account_name: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Введите корректный email"),
      password: (value) => (value.length >= 8 ? null : "Минимум 8 символов"),
      account_name: (value) => (value.trim().length > 0 ? null : "Укажите название"),
    },
  });

  return (
    <Container size={460} my={60}>
      <Title ta="center">Регистрация в statOps</Title>
      <Paper withBorder shadow="md" p="xl" mt="xl" radius="md">
        <form onSubmit={form.onSubmit((values) => register(values))}>
          <Stack>
            <TextInput
              label="Название компании / сети"
              placeholder='Например, "Кофейня на углу"'
              required
              {...form.getInputProps("account_name")}
            />
            <TextInput label="Ваше имя" {...form.getInputProps("full_name")} />
            <TextInput label="Email" required {...form.getInputProps("email")} />
            <PasswordInput
              label="Пароль"
              description="Минимум 8 символов"
              required
              {...form.getInputProps("password")}
            />
            <Button type="submit" fullWidth loading={isLoading}>
              Создать аккаунт
            </Button>
            <Anchor component={Link} to="/login" ta="center" size="sm">
              Уже есть аккаунт? Войти
            </Anchor>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
