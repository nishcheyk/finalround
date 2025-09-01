import React from "react";
import { Card, Col, Row, Typography, Badge } from "antd";
import {
  NotificationOutlined,
  TeamOutlined,
  AppstoreOutlined,
  AreaChartOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

const cards = [
  {
    key: "notifications",
    title: "Notifications",
    description: "Manage notifications for users.",
    icon: <NotificationOutlined style={{ fontSize: 36, color: "#1890ff" }} />,
    span: 12,
  },
  {
    key: "user-management",
    title: "User Management",
    description: "Manage users, roles, and permissions.",
    icon: <TeamOutlined style={{ fontSize: 36, color: "#1890ff" }} />,
    span: 12,
  },
  {
    key: "services",
    title: "Manage Services",
    description: "Add, edit, or remove services.",
    icon: <AppstoreOutlined style={{ fontSize: 36, color: "#1890ff" }} />,
    span: 24,
  },
  {
    key: "stats",
    title: "View Stats",
    description: "View platform statistics and analytics.",
    icon: <AreaChartOutlined style={{ fontSize: 36, color: "#1890ff" }} />,
    span: 12,
  },
  {
    key: "appointments",
    title: "Manage Appointments",
    description: "View and manage all appointments.",
    icon: <CalendarOutlined style={{ fontSize: 36, color: "#1890ff" }} />,
    span: 12,
  },
];

const AdminLandingPageFull: React.FC<{
  onSelectNotifications: () => void;
  onSelectUsers: () => void;
  onSelectStats?: () => void;
  onSelectAppointments?: () => void;
  onSelectServices?: () => void;
}> = ({
  onSelectNotifications,
  onSelectUsers,
  onSelectStats,
  onSelectAppointments,
  onSelectServices,
}) => {
  const getOnClickHandler = (key: string) => {
    switch (key) {
      case "notifications":
        return onSelectNotifications;
      case "user-management":
        return onSelectUsers;
      case "services":
        return onSelectServices;
      case "stats":
        return onSelectStats;
      case "appointments":
        return onSelectAppointments;
      default:
        return () => {};
    }
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        marginTop: 90,
        padding: 24,
        backgroundColor: "#f5f7fa",
        borderRadius: 8,
      }}
    >
      <Title level={2} style={{ marginBottom: 32, color: "#0958d9" }}>
        Admin Dashboard
      </Title>
      <Row gutter={[24, 24]}>
        {cards.map(({ key, title, description, icon, span, badgeCount }) => (
          <Col key={key} xs={24} sm={span}>
            <motion.div
              whileHover={{
                scale: 1.03,
                boxShadow: "0 12px 24px rgba(0,0,0,0.16)",
              }}
              whileTap={{ scale: 0.98 }}
              style={{ cursor: "pointer" }}
              onClick={getOnClickHandler(key)}
            >
              <Card
                bordered={false}
                style={{
                  height: "100%",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #f9fbff, #e6f0ff)",
                  transition: "box-shadow 0.3s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  {badgeCount ? (
                    <Badge count={badgeCount} offset={[10, 0]}>
                      {icon}
                    </Badge>
                  ) : (
                    icon
                  )}
                  <h3 style={{ marginLeft: 16, color: "#0a3d62" }}>{title}</h3>
                </div>
                <Text
                  style={{ fontSize: 15, color: "#3c4858", lineHeight: 1.5 }}
                >
                  {description}
                </Text>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AdminLandingPageFull;
