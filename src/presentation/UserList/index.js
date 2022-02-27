import React, { useEffect } from "react";
import { Row, Col, Popconfirm, Switch } from "antd";
import FeatherIcon from "feather-icons-react";
import UserListTable from "./overview/UserTable";
import { PageHeader } from "../common/UI/page-headers/page-headers";
import { AutoComplete } from "../common/UI/autoComplete/autoComplete";
import { Main, CardToolbox } from "../common/Style/styled";
import { Button } from "../common/UI/buttons/buttons";
import { useUserStore } from "./store";
import Heading from "../common/UI/heading/heading";
import ViewStudent from "./overview/ViewUser";
import CreateUser from "./overview/CreateUser";
import EditUser from "./overview/EditUser";

const UserList = () => {
  const [
    { studentList, searchData },
    {
      setVisible,
      getStudent,
      setSearchData,
      onEdit,
      onDelete,
      setVisibleEdit,
      setVisibleCreate,
      switchChange,
    },
  ] = useUserStore();
  useEffect(() => {
    window.scroll(0, 0);
    getStudent();
  }, []);
  const handleSearch = (searchText) => {
    const data = studentList?.filter((value) =>
      value.name.toUpperCase().startsWith(searchText.toUpperCase())
    );
    setSearchData(data);
  };
  const studentData = searchData?.map((student, index) => {
    console.log(student);
    return {
      key: index,
      user: (
        <div className="user-info">
          {/* <figure>
            <img
              style={{ width: "50px", height: "50px", "border-radius": "50%" }}
              src="https://picsum.photos/id/237/200/300"
              alt="Faculty"
            />
          </figure> */}
          <figcaption>
            <Heading className="user-name" as="h6">
              {student.name}
            </Heading>
            <span className="user-designation">{student.email}</span>
          </figcaption>
        </div>
      ),
      phone: student.phone,
      type: student.type,
      status:
        student.status === 1 ? (
          <span className={`status-text active`}>{"active"}</span>
        ) : student.status === 2 ? (
          <span className={`status-text blocked`}>{"blocked"}</span>
        ) : (
          <span className={`status-text deactivate`}>{"deactive"}</span>
        ),
    };
  });

  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title="User Management"
          subTitle={
            <>
              <span className="title-counter">
                {studentList?.length} Users{" "}
              </span>
              <AutoComplete
                onSearch={handleSearch}
                placeholder="Search by Name"
                width="100%"
                patterns
              />
            </>
          }
          // buttons={[
          //   <Button
          //     onClick={() => setVisibleCreate({ value: true })}
          //     key="1"
          //     type="primary"
          //     size="default"
          //   >
          //     <FeatherIcon icon="plus" size={16} /> Add New User
          //   </Button>,
          // ]}
        />
      </CardToolbox>

      <Main>
        <Row gutter={15}>
          <Col md={24}>
            <UserListTable usersTableData={studentData} />
          </Col>
        </Row>
        <ViewStudent />
        <CreateUser />
        <EditUser />
      </Main>
    </>
  );
};

export default UserList;
