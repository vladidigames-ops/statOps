import { Alert, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useGetIdentity, useList } from "@refinedev/core";
import { IconBuildingStore, IconChartBar, IconPlugConnected } from "@tabler/icons-react";

interface Identity {
  email: string;
  full_name: string | null;
  account_name: string;
  role: string;
}

interface Establishment {
  id: string;
}

interface Source {
  id: string;
}

export function DashboardPage() {
  const { data: identity } = useGetIdentity<Identity>();
  const { data: establishments } = useList<Establishment>({ resource: "establishments" });
  const { data: sources } = useList<Source>({ resource: "sources" });

  const stats = [
    {
      label: "Заведения",
      value: establishments?.data?.length ?? 0,
      icon: <IconBuildingStore size={28} />,
    },
    {
      label: "Подключённые источники",
      value: sources?.data?.length ?? 0,
      icon: <IconPlugConnected size={28} />,
    },
    {
      label: "Отчётов в работе",
      value: 0,
      icon: <IconChartBar size={28} />,
    },
  ];

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Title order={2}>Добро пожаловать{identity?.full_name ? `, ${identity.full_name}` : ""}</Title>
        <Text c="dimmed">
          {identity?.account_name ? `Аккаунт: ${identity.account_name}` : "Загрузка профиля..."}
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        {stats.map((stat) => (
          <Card key={stat.label} withBorder padding="lg" radius="md">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  {stat.label}
                </Text>
                <Title order={2}>{stat.value}</Title>
              </Stack>
              {stat.icon}
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <Alert variant="light" color="blue" title="Подключите первый источник">
        Чтобы увидеть аналитику, заведите заведение и подключите к нему iiko или Quick Resto.
        Перейдите в раздел «Заведения» → создайте запись → «Источники» → добавьте подключение.
      </Alert>
    </Stack>
  );
}
