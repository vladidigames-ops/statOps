import { Select, TextInput } from "@mantine/core";
import { Edit, useForm } from "@refinedev/mantine";

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

export function EstablishmentEditPage() {
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
    refineCoreProps: {
      meta: { canEdit: true },
    },
  });

  return (
    <Edit saveButtonProps={saveButtonProps} title="Редактирование заведения">
      <TextInput label="Название" required {...getInputProps("name")} />
      <Select label="Тип заведения" data={TYPE_OPTIONS} required mt="md" {...getInputProps("type")} />
      <TextInput label="Часовой пояс" required mt="md" {...getInputProps("timezone")} />
      <TextInput label="Валюта" required mt="md" {...getInputProps("currency")} />
    </Edit>
  );
}
