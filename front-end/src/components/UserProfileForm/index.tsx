import React from "react";
import { Form, Input, Select, Button } from "antd";
import "./index.less";

const { Option } = Select;

interface Props {
  initialValues: any;
  onFinish: (values: any) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const UserProfileForm: React.FC<Props> = ({
  initialValues,
  onFinish,
  loading,
  onCancel,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  return (
    <div style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ flex: "120px" }}
        wrapperCol={{ flex: 1 }}
        colon={false}
        onFinish={onFinish}
        className="user-profile-form"
      >
        <Form.Item
          wrapperCol={{ offset: 1 }}
          style={{ marginBottom: 32 }}
        ></Form.Item>
        <Form.Item name="nickname" label="我的昵称">
          <Input />
        </Form.Item>
        <Form.Item name="gender" label="我的性别">
          <Select>
            <Option value="男">男</Option>
            <Option value="女">女</Option>
            <Option value="保密">保密</Option>
          </Select>
        </Form.Item>
        <Form.Item name="bio" label="我的简介">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="location" label="居住地">
          <Input />
        </Form.Item>
        <Form.Item name="graduationYear" label="毕业年份">
          <Input />
        </Form.Item>
        <Form.Item name="education" label="学历">
          <Input />
        </Form.Item>
        <Form.Item name="school" label="毕业院校">
          <Input />
        </Form.Item>
        <Form.Item name="major" label="专业">
          <Input />
        </Form.Item>
        <Form.Item name="jobIntention" label="期望职位">
          <Input />
        </Form.Item>
        <Form.Item name="jobStatus" label="求职状态">
          <Input />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ marginRight: 16, marginLeft: 118 }}
        >
          确认
        </Button>
        <Button onClick={onCancel}>取消</Button>
      </Form>
    </div>
  );
};

export default UserProfileForm;
