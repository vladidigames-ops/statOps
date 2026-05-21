import { Badge, Group, Stack, Table, Text, Title } from "@mantine/core";
import { useList, useNavigation } from "@refinedev/core";
import { CreateButton, DeleteButton, EditButton, List } from "@refinedev/mantine";

interface Establishment {
  id: string;
  name: string;
  type: string;
  timezone: string;
  currency: string;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  restaurant: "Ресторан",
  cafe: "Кафе",
  bar: "Бар",
  coffeeshop: "Кофейня",
  bakery: "Пекарня",
  fastfood: "Фастфуд",
  other: "Другое",
};

export function EstablishmentListPage() {
  const { edit } = useNavigation();
  const { data, isFetched } = useList<Establishment>({ resource: "establishments" });
  const rows = data?.data ?? [];

  return (
    <List
      title={<Title order={2}>Заведения</Title>}
      headerButtons={<CreateButton>Добавить заведение</CreateButton>}
    >
      <Stack>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Название</Table.Th>
              <Table.Th>Тип</Table.Th>
              <Table.Th>Часовой пояс</Table.Th>
              <Table.Th>Валюта</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row: Establishment) => (
              <Table.Tr
                key={row.id}
                style={{ cursor: "pointer" }}
                onClick={() => edit("establishments", row.id)}
              >
                <Table.Td>
                  <Text fw={500}>{row.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light">{TYPE_LABELS[row.type] ?? row.type}</Badge>
                </Table.Td>
                <Table.Td>{row.timezone}</Table.Td>
                <Table.Td>{row.currency}</Table.Td>
                <Table.Td onClick={(e) => e.stopPropagation()}>
                  <Group gap="xs" justify="flex-end">
                    <EditButton hideText size="xs" recordItemId={row.id} />
                    <DeleteButton hideText size="xs" recordItemId={row.id} />
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        {isFetched && rows.length === 0 && (
          <Text c="dimmed" ta="center" py="lg">
            У вас пока нет заведений. Добавьте первое, чтобы подключить iiko.
          </Text>
        )}
      </Stack>
    </List>
  );
}
