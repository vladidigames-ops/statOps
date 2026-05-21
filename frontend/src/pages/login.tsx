import { Anchor, Button, Container, Paper, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLogin } from "@refinedev/core";
import { Link } from "react-router-dom";

interface LoginValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { mutate: login, isLoading } = useLogin<LoginValues>();
  const form = useForm<LoginValues>({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Введите корректный email"),
      password: (value) => (value.length >= 8 ? null : "Минимум 8 символов"),
    },
  });

  return (
    <Container size={420} my={60}>
      <Title ta="center">Вход в statOps</Title>
      <Paper withBorder shadow="md" p="xl" mt="xl" radius="md">
        <form onSubmit={form.onSubmit((values) => login(values))}>
          <Stack>
            <TextInput label="Email" required {...form.getInputProps("email")} />
            <PasswordInput label="Пароль" required {...form.getInputProps("password")} />
            <Button type="submit" fullWidth loading={isLoading}>
              Войти
            </Button>
            <Anchor component={Link} to="/register" ta="center" size="sm">
              Нет аккаунта? Зарегистрироваться
            </Anchor>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
