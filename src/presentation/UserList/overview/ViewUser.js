import React, { useState, useEffect } from "react";
import { Form, Input, Select } from "antd";
import { Button } from "../../common/UI/buttons/buttons";
import { Modal } from "../../common/UI/modals/antd-modals";
import { ModalContent } from "../style";
import moment from "moment";
import { useUserStore } from "../store";
import { logError } from "../../common/Utils";
import { onEdit } from "../../../infrastructure/faculty";
import ViewCards from "../../common/ViewCards"

const { Option } = Select;

const EditCategory = () => {
  const [form] = Form.useForm();
  const [{ viewVisible, singleRow }, { onEdit, setVisible }] =
    useUserStore();
  console.log(singleRow, "single course");
  return (
    <Modal
      type="primary"
      title="View User"
      visible={viewVisible}
      footer={[
        <div key="1" className="project-modal-footer-delete">
          <Button
            size="default"
            type="white"
            key="back"
            outlined
            onClick={() => setVisible(false)}
          >
            Cancel
          </Button>
          {/* <Button
            form="editProject"
            size="default"
            htmlType="submit"
            type="primary"
            key="submit"
            danger
          >
            Delete
          </Button> */}
        </div>,
      ]}
      onCancel={() => setVisible(false)}
    >
      <ModalContent>
        <div className="project-modal display">
          {/* <ViewCards label="Image" value={<img className="avatar" src={singleRow?.cover} />} /> */}
          <ViewCards label="User Name" value={singleRow?.name} />
          <ViewCards label="Phone Number" value={singleRow?.phonenumber} />
          <ViewCards label="Email" value={singleRow?.email} />
          <ViewCards label="Pregnant/Mother" value={singleRow?.type === 1 ? "Pregnant" : "Mother"} />
          <ViewCards label="Due Date" value={singleRow?.Date} />
        </div>
      </ModalContent>
    </Modal>
  );
};

export default EditCategory;
