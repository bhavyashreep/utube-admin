import {
  getStudentList,
  onSubmit,
  onDelete,
  onEdit,

} from "../../../infrastructure/student";
import { logError } from "../../common/Utils";
import { message } from "antd";
import firebase from "../../../config/api/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import moment from "moment";

const expertData = firebase.database().ref("/expert");
const serviceData = firebase.database().ref("/service");

const storage = getStorage();
const actions = {
  onSubmit:
    (values) =>
      async ({ setState, dispatch }) => {
        try {
          await onSubmit(values);
          dispatch(actions.setVisible(false));
          dispatch(actions.getStudent());
        } catch (error) {
          logError(error);
        }
      },
  setVisible:
    (params) =>
      ({ setState }) => {
        setState({ visible: params });
      },
  setSearchData:
    (params) =>
      ({ setState }) => {
        setState({ searchData: params });
      },
  onfinish:
    (values, image, studentList, panImage, form) =>
      async ({ setState, dispatch }) => {
        console.log("filter onfinish is working")

        console.log("image", image);
        if (Object.keys(image).length === 0) {
          message.warning("Please upload your profile photo");
        } else if (Object.keys(panImage).length === 0) {
          message.warning("Please upload your PAn card image");
        } else {
          const storageRef = ref(storage, image.name);
          const UploadedData = await uploadBytes(storageRef, image);
          const url = await getDownloadURL(UploadedData.ref);

          const panStorageRef = ref(storage, panImage.name);
          const UploadedPanData = await uploadBytes(panStorageRef, panImage);
          const panIamgeUrl = await getDownloadURL(UploadedPanData.ref);

          let checked = false;
          // if(studentList)
          for (let item = 0; item < studentList?.length; item++) {
            if (studentList[item].phone === values.phone) {
              message.warning("This phone nunber is already taken");
              console.log("stuckkk");
              checked = true;
              break;
            } else {
              checked = false;
            }
          }
          if (checked === false) {
            const currentDate = new Date();
            var CreatedDate = moment(currentDate).format("DD/MM/YYYY")
            const expertkey = expertData.push().key;
            values.phone="+91"+values.phone;
            var data = {
              ...values,
              // id: "+91" + values.phone,
              profileImage: url,
              panIamgeUrl: panIamgeUrl,
              status: 1,
              CreatedDate,
              id:expertkey,
              isVerified:false
            };
            console.log(data, "data")
            try {
              expertData.child(values.phone).update(data);
              console.log(values.services.length, "length");
              for (let i = 0; i < values.services.length; i++) {
                console.log("services in finish", values.services);
                const key = serviceData.child(values.services[i]).child("/expertsList").push().key;
                console.log(key, "key of expert");
                await serviceData.child(values.services[i]).child("expertsList").child(key).update({ 'expertId':"+91"+ values.phone, "id": key });
                console.log(serviceData, "serviceData");
              }
              form.resetFields();
              dispatch(actions.setVisible(false));
              dispatch(actions.getStudent());
            } catch (error) {
              logError(error);
            }
          }
        }
      },
  getStudent:
    () =>
      async ({ setState, dispatch }) => {
        try {

          expertData.on("value", (snapshot) => {
            console.log("object", snapshot.val())
            if (snapshot.val() !== null) {
              let responselist = Object.values(snapshot.val());
              console.log(responselist, "data list in epxetrs");
              setState({ studentList: responselist });
              dispatch(actions.setSearchData(responselist));
            } else if (snapshot.val() === null) {
              setState({ studentList: [] });
              dispatch(actions.setSearchData([]));
            }
          });


          serviceData.on("value", (snapshot) => {
            let servicelist = Object.values(snapshot.val());
            console.log(servicelist, "data list");
            setState({ serviceList: servicelist }, () => {
            });
          });
        } catch (error) {
          logError(error);
        }
      },
  setEditVisible:
    (params) =>
      ({ setState }) => {
        console.log(params, "params")
        setState({ editVisible: params.value });
        setState({ singleRow: params.data });
      },
  setViewVisible:
    (params) =>
      ({ setState }) => {
        setState({ viewVisible: params.value });
        setState({ singleRow: params.data });
      },
  onEdit:
    (values, image, studentList, panImage, id, serviceArray) =>
      async ({ setState, dispatch }) => {
        console.log("filter edit is working")
        console.log("image", image);

        let url;
        let panIamgeUrl;
        console.log(typeof image === "string", "stringg")
        if (typeof image === "string") {
          url = image;
        } else {
          const storageRef = ref(storage, image.name);
          const UploadedData = await uploadBytes(storageRef, image);
          url = await getDownloadURL(UploadedData.ref);
        }
        console.log(typeof panImage === "string", "stringg")
        if (typeof panImage === "string") {
          panIamgeUrl = panImage;
          console.log("valuessssss", values)
        } else {
          const panStorageRef = ref(storage, panImage.name);
          const UploadedPanData = await uploadBytes(panStorageRef, panImage);
          panIamgeUrl = await getDownloadURL(UploadedPanData.ref);
        }
        console.log("values", values)
        // let checked = false;
        // for (let item = 0; item < studentList.length; item++) {
        //   if (studentList[item].phone === values.phone) {
        //     message.warning("This phone nunber is already taken");
        //     console.log("stuckkk");
        //     checked = true;
        //     break;
        //   } else {
        //     checked = false;
        // if (checked === false) {

        var data = {
          ...values,
          profileImage: url,
          panIamgeUrl: panIamgeUrl
        };
        console.log(data, "data")
        try {
          let responselist;
          console.log("service array", serviceArray)
          for (let i = 0; i < serviceArray.length; i++) {
            const expertListData = serviceData.child(serviceArray[i]).child("expertsList");
            expertListData.on("value", (snapshot) => {
              if (snapshot.val() !== null) {
                responselist = Object.values(snapshot.val());
                // console.log("filter relist inside snapshot",responselist);
              }
            });
            console.log(responselist, "filter expertList of" + serviceArray[i]);
            console.log("filter edit is working before for")
            for (let j = 0; j < responselist.length; j++) {
              console.log(responselist[j], "experts" + j);

              if (responselist[j].expertId === id) {
                console.log(" filter exixts")
                console.log(responselist[j].id, 'filter id of removing expert')
                const filteringArray = await serviceData.child(serviceArray[i]).child("expertsList").child(responselist[j].id).remove();
                console.log(filteringArray, "filter removedd");
              }
            }

            //  const expertList= serviceData.child(serviceArray[i]).child("/expertsList");
            //   console.log("expertsList",expertList);
          }
          expertData.child(id).update(data);
          for (let i = 0; i < values.services.length; i++) {
            const key = serviceData.child(values.services[i]).child("/expertsList").push().key;
            console.log(key, "key of expert")
            serviceData.child(values.services[i]).child("expertsList").child(key).update({ 'expertId': "+91" + values.phone, "id": key });
            console.log(serviceData, "serviceData");
          }
          dispatch(actions.setEditVisible(false));
          dispatch(actions.getStudent());
        } catch (error) {
          logError(error);
        }
        // }
        //     }
        // }
      },
  onDelete:
    (phone, services) =>
      async ({ dispatch }) => {
        try {
          console.log("delete id", phone)
          expertData.child("+91" + phone).remove();
          let responselist;
          for (let i = 0; i < services.length; i++) {
            const expertListData = serviceData.child(services[i]).child("expertsList");
            expertListData.on("value", (snapshot) => {
              if (snapshot.val() !== null) {
                responselist = Object.values(snapshot.val());
                // console.log("filter relist inside snapshot",responselist);
              }
            });
            console.log(responselist, "filter expertList of" + services[i]);
            console.log("filter edit is working before for")
            for (let j = 0; j < responselist.length; j++) {
              console.log(responselist[j], "experts" + j);

              if (responselist[j].expertId === "+91" + phone) {
                console.log(" filter exixts")
                console.log(responselist[j].id, 'filter id of removing expert')
                const filteringArray = await serviceData.child(services[i]).child("expertsList").child(responselist[j].id).remove();
                console.log(filteringArray, "filter removedd");
              }

            }

            //  const expertList= serviceData.child(serviceArray[i]).child("/expertsList");
            //   console.log("expertsList",expertList);
          }
          dispatch(actions.setViewVisible(false));
          dispatch(actions.getStudent());

        } catch {
          logError(phone, "Edit value");
        }
      },
  getCourse:
    (page) =>
      async ({ setState }) => {
        try {
          const res = await getStudentList(page);
          setState({ course: res });
          setState({ pageNumber: page });
        } catch (error) {
          logError(error);
        }
      },
  switchChange:
    (status, id) =>
      async ({ setState }) => {
        try {
          console.log(status, "status")
          expertData.child(id).update({ status: status });
        } catch (error) {

        }
      },

};

export default actions;
