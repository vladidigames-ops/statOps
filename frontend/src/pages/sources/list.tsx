import { Badge, Group, Stack, Table, Text, Title } from "@mantine/core";
import { useList, useNavigation } from "@refinedev/core";
import { CreateButton, DeleteButton, EditButton, List } from "@refinedev/mantine";

interface Source {
  id: string;
  establishment_id: string;
  type: string;
  name: string;
  status: string;
  last_sync_at: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  iiko_cloud: "iiko Cloud",
  quick_resto: "Quick Resto",
  bank_tinkoff: "Тинькофф Бизнес",
  bank_sber: "Сбер Бизнес",
  moysklad: "МойСклад",
  onec: "1С",
};

const STATUS_COLOR: Record<string, string> = {
  ok: "green",
  pending: "yellow",
  error: "red",
  disabled: "gray",
};

const STATUS_LABEL: Record<string, string> = {
  ok: "Работает",
  pending: "Ожидает первой синхронизации",
  error: "Ошибка",
  disabled: "Отключён",
};

export function SourceListPage() {
  const { edit } = useNavigation();
  const { data, isFetched } = useList<Source>({ resource: "sources" });
  const rows = data?.data ?? [];

  return (
    <List
      title={<Title order={2}>Источники данных</Title>}
      headerButtons={<CreateButton>Подключить источник</CreateButton>}
    >
      <Stack>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Название</Table.Th>
              <Table.Th>Тип</Table.Th>
              <Table.Th>Статус</Table.Th>
              <Table.Th>Последняя синхронизация</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row: Source) => (
              <Table.Tr
                key={row.id}
                style={{ cursor: "pointer" }}
                onClick={() => edit("sources", row.id)}
              >
                <Table.Td>
                  <Text fw={500}>{row.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light">{TYPE_LABELS[row.type] ?? row.type}</Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={STATUS_COLOR[row.status] ?? "gray"} variant="light">
                    {STATUS_LABEL[row.status] ?? row.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text c="dimmed" size="sm">
                    {row.last_sync_at ? new Date(row.last_sync_at).toLocaleString("ru") : "—"}
                  </Text>
                </Table.Td>
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
            У вас пока нет подключённых источников. Добавьте подключение к iiko, чтобы начать.
          </Text>
        )}
      </Stack>
    </List>
  );
}
