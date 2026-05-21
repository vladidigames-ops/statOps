import { PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { Edit, useForm } from "@refinedev/mantine";

interface SourceValues {
  name: string;
  type: string;
  status: string;
  api_login?: string;
  api_key?: string;
  credentials?: Record<string, unknown>;
}

export function SourceEditPage() {
  const { getInputProps, saveButtonProps, values } = useForm<SourceValues>({
    initialValues: {
      name: "",
      type: "",
      status: "",
    },
    transformValues: (vals) => {
      const out: Record<string, unknown> = { name: vals.name };
      const credentials: Record<string, unknown> = {};
      if (vals.api_login) credentials.api_login = vals.api_login;
      if (vals.api_key) credentials.api_key = vals.api_key;
      if (Object.keys(credentials).length > 0) {
        out.credentials = credentials;
      }
      return out;
    },
  });

  return (
    <Edit saveButtonProps={saveButtonProps} title="Редактирование источника">
      <Stack>
        <Text c="dimmed" size="sm">
          Тип: {String(values.type)} · Статус: {String(values.status)}
        </Text>
        <TextInput label="Название подключения" required {...getInputProps("name")} />
        <PasswordInput
          label="API-логин (оставьте пустым, если не меняете)"
          {...getInputProps("api_login")}
        />
        <PasswordInput
          label="API-ключ (оставьте пустым, если не меняете)"
          {...getInputProps("api_key")}
        />
      </Stack>
    </Edit>
  );
}
