import { Badge, Box, Card, Grid, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
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
      icon: <IconBuildingStore size={22} />,
    },
    {
      label: "Подключённые источники",
      value: sources?.data?.length ?? 0,
      icon: <IconPlugConnected size={22} />,
    },
    {
      label: "Отчёты",
      value: 0,
      icon: <IconChartBar size={22} />,
    },
  ];

  const isOnboarding = (establishments?.data?.length ?? 0) === 0;

  return (
    <Stack gap="lg">
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder radius="lg" p="xl" style={{ minHeight: 320 }}>
            <Stack gap="md">
              <Text size="xs" tt="uppercase" c="emerald" fw={700}>
                Workbench · Control Room
              </Text>
              <Title order={1} style={{ fontSize: 40, lineHeight: 1.1 }}>
                {isOnboarding
                  ? "Подключаем заведение к аналитике."
                  : `Добро пожаловать${identity?.full_name ? `, ${identity.full_name.split(" ")[0]}` : ""}.`}
              </Title>
              <Text c="dimmed" size="md" maw={520}>
                {isOnboarding
                  ? "Заведите ресторан, кофейню или бар, подключите iiko или Quick Resto — дальше система сама будет тянуть продажи, считать foodcost и собирать отчёты."
                  : `Аккаунт ${identity?.account_name ?? ""}. Здесь будет сводка по выручке, foodcost и прибыли — как только подключатся источники.`}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder radius="lg" p="lg" style={{ height: "100%" }}>
            <Stack gap="sm">
              <Group gap="xs">
                <Box w={6} h={6} bg="emerald" style={{ borderRadius: 999 }} />
                <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
                  Текущий фокус
                </Text>
              </Group>
              <Title order={3}>Подключение источников</Title>
              <Text size="sm" c="dimmed">
                На первом этапе платформа собирает данные из iiko, нормализует
                их в единую модель и хранит сырьё для перерасчётов.
              </Text>
              <Badge color="emerald" variant="light" mt="xs" w="fit-content">
                Спринт 1 · Скелет
              </Badge>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        {stats.map((stat) => (
          <Card key={stat.label} withBorder padding="lg" radius="lg">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  {stat.label}
                </Text>
                <Title order={2}>{stat.value}</Title>
              </Stack>
              <Box c="emerald">{stat.icon}</Box>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
