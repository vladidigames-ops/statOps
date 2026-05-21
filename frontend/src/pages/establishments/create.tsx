import { Select, TextInput } from "@mantine/core";
import { Create, useForm } from "@refinedev/mantine";

interface EstablishmentValues {
  name: string;
  type: string;
  timezone: string;
  currency: string;
}

const TYPE_OPTIONS = [
  { value: "restaurant", label: "Ресторан" },
  { value: "cafe", label: "Кафе" },
  { value: "bar", label: "Бар" },
  { value: "coffeeshop", label: "Кофейня" },
  { value: "bakery", label: "Пекарня" },
  { value: "fastfood", label: "Фастфуд" },
  { value: "other", label: "Другое" },
];

export function EstablishmentCreatePage() {
  const { getInputProps, saveButtonProps } = useForm<EstablishmentValues>({
    initialValues: {
      name: "",
      type: "restaurant",
      timezone: "Europe/Moscow",
      currency: "RUB",
    },
    validate: {
      name: (value: unknown) =>
        typeof value === "string" && value.trim().length > 0 ? null : "Укажите название",
    },
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Новое заведение">
      <TextInput label="Название" required {...getInputProps("name")} />
      <Select
        label="Тип заведения"
        data={TYPE_OPTIONS}
        required
        mt="md"
        {...getInputProps("type")}
      />
      <TextInput label="Часовой пояс" required mt="md" {...getInputProps("timezone")} />
      <TextInput label="Валюта" required mt="md" {...getInputProps("currency")} />
    </Create>
  );
}
