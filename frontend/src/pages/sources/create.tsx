import { Alert, PasswordInput, Select, TextInput } from "@mantine/core";
import { useList } from "@refinedev/core";
import { Create, useForm } from "@refinedev/mantine";

interface SourceValues {
  establishment_id: string;
  type: string;
  name: string;
  credentials: Record<string, unknown>;
  // helper fields, mapped into credentials on submit
  api_login?: string;
  api_key?: string;
}

interface Establishment {
  id: string;
  name: string;
}

const SOURCE_TYPES = [
  { value: "iiko_cloud", label: "iiko Cloud" },
  { value: "quick_resto", label: "Quick Resto" },
  { value: "bank_tinkoff", label: "Тинькофф Бизнес" },
  { value: "bank_sber", label: "Сбер Бизнес" },
  { value: "moysklad", label: "МойСклад" },
  { value: "onec", label: "1С" },
];

export function SourceCreatePage() {
  const { data: establishments } = useList<Establishment>({ resource: "establishments" });

  const { getInputProps, saveButtonProps, values, setFieldValue } = useForm<SourceValues>({
    initialValues: {
      establishment_id: "",
      type: "iiko_cloud",
      name: "",
      credentials: {},
    },
    validate: {
      establishment_id: (value: unknown) => (value ? null : "Выберите заведение"),
      name: (value: unknown) =>
        typeof value === "string" && value.trim().length > 0 ? null : "Укажите название",
    },
    transformValues: (vals) => {
      const credentials: Record<string, unknown> = {};
      if (vals.api_login) credentials.api_login = vals.api_login;
      if (vals.api_key) credentials.api_key = vals.api_key;
      return {
        establishment_id: vals.establishment_id,
        type: vals.type,
        name: vals.name,
        credentials,
      };
    },
  });

  const establishmentOptions =
    establishments?.data?.map((e) => ({ value: e.id, label: e.name })) ?? [];

  return (
    <Create saveButtonProps={saveButtonProps} title="Подключение источника">
      {establishmentOptions.length === 0 && (
        <Alert color="yellow" mb="md">
          Сначала создайте хотя бы одно заведение в разделе «Заведения».
        </Alert>
      )}

      <Select
        label="Заведение"
        data={establishmentOptions}
        required
        searchable
        {...getInputProps("establishment_id")}
      />

      <Select
        label="Тип источника"
        data={SOURCE_TYPES}
        required
        mt="md"
        value={values.type as string}
        onChange={(v) => v && setFieldValue("type", v)}
      />

      <TextInput
        label="Название подключения"
        placeholder="Например, iiko — основной зал"
        required
        mt="md"
        {...getInputProps("name")}
      />

      {values.type === "iiko_cloud" && (
        <PasswordInput
          label="API-логин iikoCloud"
          description="Создаётся в личном кабинете iiko.biz"
          required
          mt="md"
          {...getInputProps("api_login")}
        />
      )}

      {(values.type === "quick_resto" ||
        values.type === "moysklad" ||
        values.type === "bank_tinkoff" ||
        values.type === "bank_sber") && (
        <PasswordInput
          label="API-ключ / токен"
          required
          mt="md"
          {...getInputProps("api_key")}
        />
      )}

      {values.type === "onec" && (
        <Alert color="blue" mt="md">
          Подключение к 1С требует индивидуальной настройки — обратитесь к администратору.
        </Alert>
      )}
    </Create>
  );
}
