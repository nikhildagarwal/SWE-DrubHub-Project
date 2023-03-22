

window.onload = startType();

function startType(){
  var userID = getUID();
  fetch("/prescription/accountType",{
      method: "POST",
      cache: "no-cache",
      body: JSON.stringify(userID)
  }).then((response) =>{
    var ourPromise = response.json();
    //console.log(ourPromise);
    ourPromise.then((result) =>{
      let ourType = result.type;
      if(ourType.toUpperCase() == "DOCTOR"){
        document.querySelector(".main-boxtwo").className = document.querySelector(".main-boxtwo").className.substring(0,8);
        document.querySelector(".generate-boxone").className = document.querySelector(".generate-boxone").className.substring(0,12);
      }
      if(ourType.toUpperCase() == "PATIENT"){
        document.querySelector(".main-boxone").className = document.querySelector(".main-boxone").className.substring(0,8);
      }
    })
  })
  /*var set = new Set();
  while(set.size<=499){
    const randomNumber1 = Math.floor(Math.random() * 900) + 100;
    const randomNumber2 = Math.floor(Math.random() * 9000) + 1000;
    const randomLetter1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const randomLetter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    let randomPrescription = randomNumber1+"-"+randomNumber2+"-"+randomLetter1.toUpperCase()+randomLetter2.toUpperCase();
    set.add(randomPrescription);
  }
  console.log(set);
  set.forEach((value)=>{
    console.log(value);
    fetch("/create/prescriptionBank",{
      method:"POST",
      cache:"no-cache",
      body:JSON.stringify(value)
    })
  });*/
  
}

function getUID(){
  if(localStorage.getItem("User Record")==null){
    alert("Please create an account / log in, to add a prescription. Thank You!");
  }else{
    var user_record = JSON.parse(localStorage.getItem("User Record"));
    var uid = user_record.uid;
    return uid;
  }
}

function getEmail(){
  if(localStorage.getItem("User Record")==null){
    alert("Please create an account / log in, to add a prescription. Thank You!");
  }else{
    var user_record = JSON.parse(localStorage.getItem("User Record"));
    var email = user_record.email;
    return email;
  }
}

console.log(getUID());
console.log(getEmail());
let counter = 0;
document.querySelector(".generate-button").addEventListener("click",() =>{
  counter++;
  if(counter%2==1){
    fetch("/get/random/number",{
      method:"GET",
      cache:"no-cache"
    }).then((response)=>{
      var numberPromise = response.json();
      numberPromise.then((result)=>{
        let number = result.number;
        document.querySelector(".generate-button").innerHTML = number;
      })
    })
    
  }else{
    document.querySelector(".generate-button").innerHTML = "Generate Prescription Number";
  }
})

document.querySelector(".acknowledgement-box").addEventListener("click",() =>{
  document.querySelector(".acknowledgement-box").classList.toggle("clicked");
  document.querySelector(".title-next-next").classList.toggle("next");
})

document.querySelector(".acknowledgement-box-doctor").addEventListener("click",() =>{
  document.querySelector(".acknowledgement-box-doctor").classList.toggle("clicked");
  document.querySelector(".title-next-next-doctor").classList.toggle("next");
})


document.querySelector(".submit-box1").addEventListener("click", () =>{
  let classNameLabel = document.querySelector(".acknowledgement-box").className;
  if(classNameLabel.charAt(classNameLabel.length-1)!="d"){
    alert("Please click the button above to acknowledge that all boxes are accurately filled");
    return;
  }
  var currentUID = getUID();
  var firstName = document.getElementById("fname").value;
  if(!checkName(firstName)){
    return;
  }
  var lastName = document.getElementById("lname").value;
  if(!checkName(lastName)){
    return;
  }
  var email = document.getElementById("email").value;
  if(!checkEmail(email)){
    return;
  }
  var issueDate = document.getElementById("rd").value;
  if(!checkDate(issueDate)){
    return;
  }
  var dateOfBirth = document.getElementById("dob").value;
  if(!checkDate(dateOfBirth)){
      return;
  }
  var prescriptionNumber = document.getElementById("DOB").value;
  fetch("/get/prescriptionBank",{
    method:"POST",
    cache:"no-cache",
    body: JSON.stringify(prescriptionNumber)
  }).then((response)=>{
    var bankPromise = response.json();
    bankPromise.then((result)=>{
      var returnValue = result.returnValue;
      if(returnValue){
        if(getEmail() != email){
          alert("The email provided in the form does not match the email address of this account! Patients may only request prescriptions to their own account.");
          return;
        }
        if(getEmail() == email){
          var data = {
            dateOfBirth: dateOfBirth,
            firstName: firstName.toUpperCase(),
            issueDate: issueDate,
            lastName: lastName.toUpperCase(),
            patientEmail:email,
            patientUID: currentUID,
            prescriptionNumber:prescriptionNumber,
          }
          fetch("/make/patientPrescription",{
            method: "POST",
            cache: "no-cache",
            body: JSON.stringify(data)
          }).then((response)=>{
            console.log(response.json());
            if(response.status == 201){
              fetch("/move/prescription/patient/Pipeline",{
                method:"POST",
                cache:"no-cache",
                body: JSON.stringify(prescriptionNumber)
              })
              
              fetch("/prescriptions/getDoctorList",{
                method: "GET",
                cache: "no-cache"
              }).then((response) => {
                var doctorListPromise =  response.json();
                console.log(response.status);
                doctorListPromise.then((result) =>{
                  console.log("processing doctor list");
                  let fullList = result.doctorPrescriptionsList;
                  let prescriptions = Object.values(fullList);
                  for(let i = 0;i<prescriptions.length;i++){
                    let allPrescriptionValues = Object.values(prescriptions[i]);
                    for(let j = 0;j<allPrescriptionValues.length;j++){
                      let currPrescriptionFromDoctor = allPrescriptionValues[j];
            
                      /**Prescription information to crossCheck with patient prescription */
                      let patientDOBFromDoctor = currPrescriptionFromDoctor.dateOfBirth;
                      let issueDateFromDoctor = currPrescriptionFromDoctor.issueDate;
                      let patientFirstName = currPrescriptionFromDoctor.patientFirstName;
                      let patientLastName = currPrescriptionFromDoctor.patientLastName;
                      let prescriptionNumberFromDoctor = currPrescriptionFromDoctor.prescriptionNumber;
      
                      let allTrue = true;
                      if(patientDOBFromDoctor!=dateOfBirth){
                        allTrue = false;
                      }
                      if(issueDateFromDoctor!=issueDate){
                        allTrue = false;
                      }
                      if(patientFirstName!=firstName.toUpperCase()){
                        allTrue = false;
                      }
                      if(patientLastName!=lastName.toUpperCase()){
                        allTrue = false;
                      }
                      if(prescriptionNumberFromDoctor!=prescriptionNumber){
                        allTrue = false;
                      }
                      if(allTrue){
                        console.log("all points checked out");
                        i = prescriptions.length;
                        j = allPrescriptionValues.length;
                        /**Prescription information to add to validated prescription */
                      let medication = currPrescriptionFromDoctor.medication;
                      let doctorEmail = currPrescriptionFromDoctor.doctorEmail;
                      let doctorFirstName = currPrescriptionFromDoctor.doctorFirstName;
                      let doctorLastName = currPrescriptionFromDoctor.doctorLastName;
                      let doctorUID = currPrescriptionFromDoctor.doctorUID;
                      let dosage = currPrescriptionFromDoctor.dosage;
                      let expireDate = currPrescriptionFromDoctor.expireDate;
                      let instructions = currPrescriptionFromDoctor.instructions;
                      let refills = currPrescriptionFromDoctor.refills;
                        var dataToSend = {
                          dateOfBirth:dateOfBirth,
                          doctorAccountEmail:doctorEmail,
                          doctorFirstName:doctorFirstName,
                          doctorLastName:doctorLastName,
                          doctorUID:doctorUID,
                          dosage:dosage,
                          expireDate:expireDate,
                          instructions:instructions,
                        issueDate:issueDate,
                        medication:medication,
                        patientAccountEmail:email,
                        patientFirstName:firstName.toUpperCase(),
                        patientLastName:lastName.toUpperCase(),
                        patientUID:currentUID,
                        prescriptionNumber:prescriptionNumber,
                        refills:refills
                        }
      
                        fetch("/make/validatedPrescription",{
                          method: "POST",
                          cache: "no-cache",
                          body: JSON.stringify(dataToSend)
                        }).then((response)=>{
                          console.log(response.status);
                          if(response.status==201){
                            console.log("prescription validated");
                            var sendToDelete = {
                              patientUID:currentUID,
                              prescriptionNumber: prescriptionNumber
                            };
                            fetch("/delete/patientPrescription",{
                              method:"DELETE",
                              cache:"no-cache",
                              body:JSON.stringify(sendToDelete)
                            }).then((response)=>{
                              console.log(response.status);
                              if(response.status==204){
                                console.log("prescription Deleted from patient Pending Path");
                              }
                            })
                            var sendToDeleteDoctor = {
                              doctorUID:doctorUID,
                              prescriptionNumber:prescriptionNumber
                            }
                            fetch("/delete/doctorPrescription",{
                              method:"DELETE",
                              cache:"no-cache",
                              body:JSON.stringify(sendToDeleteDoctor)
                            }).then((response)=>{
                              console.log(response.status);
                              if(response.status == 204){
                                console.log("prescription Deleted from Doctor pending path");
                              }
                            })
                            window.location.href = "./submitted-prescription-patient-validated.html";
                          }else{
                            console.log("error: prescription not validated");
                          }
                        })
                        
                      }else{
                        
                      }
                    }
                  }
                  console.log("all points do not check out");
                        window.location.href = "./submitted-prescription-patient-wait.html";
                })
              })
              console.log("prescription added");
              
              
            }else{
              console.log("prescription not added");
            }
          })
          /*set(ref(db,"patientPrescriptions/"+foundUSERID+"/"),{
            firstName: firstName.toUpperCase(),
            lastName: lastName.toUpperCase(),
            patientEmail:email,
            issueDate: issueDate,
            dateOfBirth: dateOfBirth,
            prescriptionNumber:prescriptionNumber,
            patientUID: currentUID
          })*/
        }
      }else{
        fetch("/get/pipeline/doctor",{
          method:"POST",
          cache:"no-cache",
          body:JSON.stringify(prescriptionNumber)
        }).then((response)=>{
          var pipelineDoctorPromise = response.json();
          pipelineDoctorPromise.then((result)=>{
            var returnValue = result.returnValue;
            if(returnValue){
              if(getEmail() != email){
                alert("The email provided in the form does not match the email address of this account! Patients may only request prescriptions to their own account.");
                return;
              }
              if(getEmail() == email){
                var data = {
                  dateOfBirth: dateOfBirth,
                  firstName: firstName.toUpperCase(),
                  issueDate: issueDate,
                  lastName: lastName.toUpperCase(),
                  patientEmail:email,
                  patientUID: currentUID,
                  prescriptionNumber:prescriptionNumber,
                }
                fetch("/make/patientPrescription",{
                  method: "POST",
                  cache: "no-cache",
                  body: JSON.stringify(data)
                }).then((response)=>{
                  console.log(response.json());
                  if(response.status == 201){
                    
                    fetch("/prescriptions/getDoctorList",{
                      method: "GET",
                      cache: "no-cache"
                    }).then((response) => {
                      var doctorListPromise =  response.json();
                      console.log(response.status);
                      doctorListPromise.then((result) =>{
                        console.log("processing doctor list");
                        let fullList = result.doctorPrescriptionsList;
                        let prescriptions = Object.values(fullList);
                        for(let i = 0;i<prescriptions.length;i++){
                          let allPrescriptionValues = Object.values(prescriptions[i]);
                          for(let j = 0;j<allPrescriptionValues.length;j++){
                            let currPrescriptionFromDoctor = allPrescriptionValues[j];
                  
                            /**Prescription information to crossCheck with patient prescription */
                            let patientDOBFromDoctor = currPrescriptionFromDoctor.dateOfBirth;
                            let issueDateFromDoctor = currPrescriptionFromDoctor.issueDate;
                            let patientFirstName = currPrescriptionFromDoctor.patientFirstName;
                            let patientLastName = currPrescriptionFromDoctor.patientLastName;
                            let prescriptionNumberFromDoctor = currPrescriptionFromDoctor.prescriptionNumber;
            
                            let allTrue = true;
                            if(patientDOBFromDoctor!=dateOfBirth){
                              allTrue = false;
                            }
                            if(issueDateFromDoctor!=issueDate){
                              allTrue = false;
                            }
                            if(patientFirstName!=firstName.toUpperCase()){
                              allTrue = false;
                            }
                            if(patientLastName!=lastName.toUpperCase()){
                              allTrue = false;
                            }
                            if(prescriptionNumberFromDoctor!=prescriptionNumber){
                              allTrue = false;
                            }
                            if(allTrue){
                              console.log("all points checked out");
                              i = prescriptions.length;
                              j = allPrescriptionValues.length;
                              /**Prescription information to add to validated prescription */
                            let medication = currPrescriptionFromDoctor.medication;
                            let doctorEmail = currPrescriptionFromDoctor.doctorEmail;
                            let doctorFirstName = currPrescriptionFromDoctor.doctorFirstName;
                            let doctorLastName = currPrescriptionFromDoctor.doctorLastName;
                            let doctorUID = currPrescriptionFromDoctor.doctorUID;
                            let dosage = currPrescriptionFromDoctor.dosage;
                            let expireDate = currPrescriptionFromDoctor.expireDate;
                            let instructions = currPrescriptionFromDoctor.instructions;
                            let refills = currPrescriptionFromDoctor.refills;
                              var dataToSend = {
                                dateOfBirth:dateOfBirth,
                                doctorAccountEmail:doctorEmail,
                                doctorFirstName:doctorFirstName,
                                doctorLastName:doctorLastName,
                                doctorUID:doctorUID,
                                dosage:dosage,
                                expireDate:expireDate,
                                instructions:instructions,
                              issueDate:issueDate,
                              medication:medication,
                              patientAccountEmail:email,
                              patientFirstName:firstName.toUpperCase(),
                              patientLastName:lastName.toUpperCase(),
                              patientUID:currentUID,
                              prescriptionNumber:prescriptionNumber,
                              refills:refills
                              }
            
                              fetch("/make/validatedPrescription",{
                                method: "POST",
                                cache: "no-cache",
                                body: JSON.stringify(dataToSend)
                              }).then((response)=>{
                                console.log(response.status);
                                if(response.status==201){
                                  fetch("/move/doctor/pipeline/active",{
                                    method:"POST",
                                    cache:"no-cache",
                                    body:JSON.stringify(prescriptionNumber)
                                  })
                                  console.log("prescription validated");
                                  var sendToDelete = {
                                    patientUID:currentUID,
                                    prescriptionNumber: prescriptionNumber
                                  };
                                  fetch("/delete/patientPrescription",{
                                    method:"DELETE",
                                    cache:"no-cache",
                                    body:JSON.stringify(sendToDelete)
                                  }).then((response)=>{
                                    console.log(response.status);
                                    if(response.status==204){
                                      console.log("prescription Deleted from patient Pending Path");
                                    }
                                  })
                                  var sendToDeleteDoctor = {
                                    doctorUID:doctorUID,
                                    prescriptionNumber:prescriptionNumber
                                  }
                                  fetch("/delete/doctorPrescription",{
                                    method:"DELETE",
                                    cache:"no-cache",
                                    body:JSON.stringify(sendToDeleteDoctor)
                                  }).then((response)=>{
                                    console.log(response.status);
                                    if(response.status == 204){
                                      console.log("prescription Deleted from Doctor pending path");
                                    }
                                  })
                                  window.location.href = "./submitted-prescription-patient-validated.html";
                                }else{
                                  console.log("error: prescription not validated");
                                }
                              })
                              
                            }else{
                              
                            }
                          }
                        }
                        console.log("all points do not check out");
                              window.location.href = "./submitted-prescription-patient-wait.html";
                      })
                    })
                    console.log("prescription added");
                    
                    
                  }else{
                    console.log("prescription not added");
                  }
                })
                /*set(ref(db,"patientPrescriptions/"+foundUSERID+"/"),{
                  firstName: firstName.toUpperCase(),
                  lastName: lastName.toUpperCase(),
                  patientEmail:email,
                  issueDate: issueDate,
                  dateOfBirth: dateOfBirth,
                  prescriptionNumber:prescriptionNumber,
                  patientUID: currentUID
                })*/
              }
            }else{
              alert("The prescription number provided is not valid for request. Please double check your prescription or contact your Doctor if there is an error")
              return;
            }
          })
        })
      }
    })
  })
  //console.log(fullName.toUpperCase());
  
  
  
  
})

document.querySelector(".submit-box2").addEventListener("click",()=>{
  let classNameLabel = document.querySelector(".acknowledgement-box-doctor").className;
  if(classNameLabel.charAt(classNameLabel.length-1)!="d"){
    alert("Please click the button above to acknowledge that all boxes are accurately filled");
    return;
  }
  var currentUID = getUID();
  var patientFirstName = document.getElementById("dpfname").value.toUpperCase();
  var patientLastName = document.getElementById("dplname").value.toUpperCase();
  var patientDOB = document.getElementById("dpatientDateOfBirth").value;
  var doctorFirstName = document.getElementById("dfname").value.toUpperCase();
  var doctorLastName = document.getElementById("dlname").value.toUpperCase();
  var doctorAccountEmail = document.getElementById("demail").value;
  var issueDate = document.getElementById("dDOB").value;
  var expireDate = document.getElementById("drd").value;
  var medication = document.getElementById("dmedication").value;
  var dosage = document.getElementById("ddosage").value;
  var refills = document.getElementById("drefills").value;
  var prescriptionNumber = document.getElementById("dprescriptionNumber").value;
  fetch("/get/prescriptionBank",{
    method:"POST",
    cache:"no-cache",
    body: JSON.stringify(prescriptionNumber)
  }).then((response)=>{
    var bankPromise = response.json();
    bankPromise.then((result)=>{
      var returnValue = result.returnValue;
      if(returnValue){
        var instructions = document.getElementById("dinstructions").value; 
  //console.log("hi");
  //console.log("hi".toUpperCase());
  //console.log("hi342lksdj".toUpperCase());
  if(!checkName(patientFirstName)){
    return;
  }
  if(!checkName(patientLastName)){
    return;
  }
  if(!checkDate(patientDOB)){
    return;
  }
  if(!checkName(doctorFirstName)){
    return;
  }
  if(!checkName(doctorLastName)){
    return;
  }
  if(!checkEmail(doctorAccountEmail)){
    return;
  }
  if(!checkDate(issueDate)){
    return;
  }
  if(!checkDate(expireDate)){
    return;
  }
  if(!checkMeasurement(dosage)){
    alert("Please add measurement units after the dosage amount. Ex: mg, g, ml");
    return;
  }
  if(!checkRefills(refills)){
    return;
  }
  if(getEmail()!=doctorAccountEmail){
    alert("The email provided in the form does not match the email address of this account! Doctors many only fill prescriptions to their own accounts.");
    return;
  }
      if(getEmail() == doctorAccountEmail){
        var data = {
          dateOfBirth: patientDOB,
          doctorEmail: doctorAccountEmail,
          doctorFirstName: doctorFirstName.toUpperCase(),
          doctorLastName: doctorLastName.toUpperCase(),
          doctorUID: currentUID,
          dosage: dosage,
          expireDate: expireDate,
          instructions: instructions,
          issueDate: issueDate,
          medication: medication.toUpperCase(),
          patientFirstName: patientFirstName.toUpperCase(),
          patientLastName: patientLastName.toUpperCase(),
          prescriptionNumber: prescriptionNumber,
          refills: refills
        }
        fetch("/make/doctorPrescription",{
          method: "POST",
          cache: "no-cache",
          body: JSON.stringify(data)
        }).then((response) => {
          console.log(response.json());
          if(response.status == 201){
            fetch("/move/prescription/toPipeline/doctor",{
              method:"POST",
              cache:"no-cache",
              body: JSON.stringify(prescriptionNumber)
            })
            fetch("/prescriptions/getPatientList",{
              method: "GET",
              cache: "no-cache",
            }).then((response)=>{
              console.log(response.status);
              var patientListPromise = response.json();
              console.log(patientListPromise);
              patientListPromise.then((result)=>{
                console.log("Processing Patient Prescriptions");
                var fullList = result.patientPrescriptionList;
                var prescriptions = Object.values(fullList);
                console.log(prescriptions);
                for(let i =0;i<prescriptions.length;i++){
                  let prescriptionsForEachUID = Object.values(prescriptions[i]);
                  for(let j = 0;j<prescriptionsForEachUID.length;j++){
                    let currPrescriptionFromPatient = prescriptionsForEachUID[j];
                    console.log(currPrescriptionFromPatient);
          
                    /** Prescription Data to compare */
                    let patientDOBFromPatient = currPrescriptionFromPatient.dateOfBirth;
                    let issueDateFromPatient = currPrescriptionFromPatient.issueDate;
                    let patientFirstNameFromPatient = currPrescriptionFromPatient.firstName;
                    let patientLastNameFromPatient = currPrescriptionFromPatient.lastName;
                    let prescriptionNumberFromPatient = currPrescriptionFromPatient.prescriptionNumber;
                    let patientEmail = currPrescriptionFromPatient.patientEmail;
          
                    let allTrue = true;
                    if(patientDOBFromPatient!=patientDOB){
                      allTrue = false;
                    }
                    if(issueDateFromPatient != issueDate){
                      allTrue = false;
                    }
                    if(patientFirstNameFromPatient != patientFirstName){
                      allTrue = false;
                    }
                    if(patientLastNameFromPatient!= patientLastName){
                      allTrue = false;
                    }
                    if(prescriptionNumberFromPatient!=prescriptionNumber){
                      allTrue = false;
                    }
                    if(allTrue){
                      console.log("all points checked out");
                      i = prescriptions.length;
                      j = prescriptionsForEachUID.length;
                      var dataToSend = {
                        dateOfBirth:patientDOBFromPatient,
                        doctorAccountEmail:doctorAccountEmail,
                        doctorFirstName:doctorFirstName,
                        doctorLastName:doctorLastName,
                        doctorUID:currentUID,
                        dosage:dosage,
                        expireDate:expireDate,
                        instructions:instructions,
                        issueDate:issueDate,
                        medication:medication,
                        patientAccountEmail:patientEmail,
                        patientFirstName:patientFirstNameFromPatient,
                        patientLastName:patientLastNameFromPatient,
                        patientUID:currPrescriptionFromPatient.patientUID,
                        prescriptionNumber:prescriptionNumber,
                        refills:refills
                      }
                      fetch("/make/validatedPrescription",{
                        method: "POST",
                        cache:"no-cache",
                        body: JSON.stringify(dataToSend)
                      }).then((response) => {
                        console.log(response.status);
                        if(response.status == 201){
                          
                          console.log("prescription validated");
                          var sendToDelete = {
                            patientUID:currPrescriptionFromPatient.patientUID,
                            prescriptionNumber: prescriptionNumber
                          };
                          fetch("/delete/patientPrescription",{
                            method:"DELETE",
                            cache:"no-cache",
                            body:JSON.stringify(sendToDelete)
                          }).then((response)=>{
                            console.log(response.status);
                            if(response.status==204){
                              console.log("prescription Deleted from patient Pending Path");
                            }
                          })
                          var sendToDeleteDoctor = {
                            doctorUID:currentUID,
                            prescriptionNumber:prescriptionNumber
                          }
                          fetch("/delete/doctorPrescription",{
                            method:"DELETE",
                            cache:"no-cache",
                            body:JSON.stringify(sendToDeleteDoctor)
                          }).then((response)=>{
                            console.log(response.status);
                            if(response.status == 204){
                              console.log("prescription Deleted from Doctor pending path");
                            }
                          })
                          var sendData = {
                            doctorFirstName: doctorFirstName,
                            doctorLastName: doctorLastName,
                            prescriptionNumber: prescriptionNumber
                          }
                          fetch(`/send/validationEmail?email=${patientEmail}`, {
                            method: "Post",
                            cache: "no-cache",
                            body: JSON.stringify(sendData)
                          }).then((response)=>{
                            console.log(response.status);
                          })
                          window.location.href = "./submitted-prescription-doctor-validated.html";
                        }else{
                          console.log("prescription not validated");
                        }
                      })
                    }else{

                    }
                  }
                }
                console.log("all points do not check out");
                window.location.href = "./submitted-prescription-doctor-wait.html";
              })
            })
        }else{
            console.log("not good :(");
        }
        })
        /**set(ref(db,"doctorPrescriptions/"+foundUSERID+"/"),{
          patientFirstName: patientFirstName.toUpperCase(),
          patientLastName: patientLastName.toUpperCase(),
          dateOfBirth: patientDOB,
          doctorFirstName: doctorFirstName.toUpperCase(),
          doctorLastName: doctorLastName.toUpperCase(),
          doctorEmail: doctorAccountEmail,
          issueDate: issueDate,
          expireDate: expireDate,
          medication: medication.toUpperCase(),
          dosage: dosage,
          refills: refills,
          prescriptionNumber: prescriptionNumber,
          instructions: instructions,
          doctorUID: currentUID
        })*/
        
        }
      }else{
        fetch("/get/pipeline/patient",{
          method:"POST",
          cache:"no-cache",
          body:JSON.stringify(prescriptionNumber)
        }).then((response)=>{
          var pipeplinePatientPromise = response.json();
          pipeplinePatientPromise.then((result)=>{
            var returnValue = result.returnValue;
            if(returnValue){
              var instructions = document.getElementById("dinstructions").value; 
  //console.log("hi");
  //console.log("hi".toUpperCase());
  //console.log("hi342lksdj".toUpperCase());
  if(!checkName(patientFirstName)){
    return;
  }
  if(!checkName(patientLastName)){
    return;
  }
  if(!checkDate(patientDOB)){
    return;
  }
  if(!checkName(doctorFirstName)){
    return;
  }
  if(!checkName(doctorLastName)){
    return;
  }
  if(!checkEmail(doctorAccountEmail)){
    return;
  }
  if(!checkDate(issueDate)){
    return;
  }
  if(!checkDate(expireDate)){
    return;
  }
  if(!checkMeasurement(dosage)){
    alert("Please add measurement units after the dosage amount. Ex: mg, g, ml");
    return;
  }
  if(!checkRefills(refills)){
    return;
  }
  if(getEmail()!=doctorAccountEmail){
    alert("The email provided in the form does not match the email address of this account! Doctors many only fill prescriptions to their own accounts.");
    return;
  }
      if(getEmail() == doctorAccountEmail){
        var data = {
          dateOfBirth: patientDOB,
          doctorEmail: doctorAccountEmail,
          doctorFirstName: doctorFirstName.toUpperCase(),
          doctorLastName: doctorLastName.toUpperCase(),
          doctorUID: currentUID,
          dosage: dosage,
          expireDate: expireDate,
          instructions: instructions,
          issueDate: issueDate,
          medication: medication.toUpperCase(),
          patientFirstName: patientFirstName.toUpperCase(),
          patientLastName: patientLastName.toUpperCase(),
          prescriptionNumber: prescriptionNumber,
          refills: refills
        }
        fetch("/make/doctorPrescription",{
          method: "POST",
          cache: "no-cache",
          body: JSON.stringify(data)
        }).then((response) => {
          console.log(response.json());
          if(response.status == 201){
            fetch("/move/prescription/toPipeline",{
              method:"POST",
              cache:"no-cache",
              body: JSON.stringify(prescriptionNumber)
            })
            fetch("/prescriptions/getPatientList",{
              method: "GET",
              cache: "no-cache",
            }).then((response)=>{
              console.log(response.status);
              var patientListPromise = response.json();
              console.log(patientListPromise);
              patientListPromise.then((result)=>{
                console.log("Processing Patient Prescriptions");
                var fullList = result.patientPrescriptionList;
                var prescriptions = Object.values(fullList);
                console.log(prescriptions);
                for(let i =0;i<prescriptions.length;i++){
                  let prescriptionsForEachUID = Object.values(prescriptions[i]);
                  for(let j = 0;j<prescriptionsForEachUID.length;j++){
                    let currPrescriptionFromPatient = prescriptionsForEachUID[j];
                    console.log(currPrescriptionFromPatient);
          
                    /** Prescription Data to compare */
                    let patientDOBFromPatient = currPrescriptionFromPatient.dateOfBirth;
                    let issueDateFromPatient = currPrescriptionFromPatient.issueDate;
                    let patientFirstNameFromPatient = currPrescriptionFromPatient.firstName;
                    let patientLastNameFromPatient = currPrescriptionFromPatient.lastName;
                    let prescriptionNumberFromPatient = currPrescriptionFromPatient.prescriptionNumber;
                    let patientEmail = currPrescriptionFromPatient.patientEmail;
          
                    let allTrue = true;
                    if(patientDOBFromPatient!=patientDOB){
                      allTrue = false;
                    }
                    if(issueDateFromPatient != issueDate){
                      allTrue = false;
                    }
                    if(patientFirstNameFromPatient != patientFirstName){
                      allTrue = false;
                    }
                    if(patientLastNameFromPatient!= patientLastName){
                      allTrue = false;
                    }
                    if(prescriptionNumberFromPatient!=prescriptionNumber){
                      allTrue = false;
                    }
                    if(allTrue){
                      console.log("all points checked out");
                      i = prescriptions.length;
                      j = prescriptionsForEachUID.length;
                      var dataToSend = {
                        dateOfBirth:patientDOBFromPatient,
                        doctorAccountEmail:doctorAccountEmail,
                        doctorFirstName:doctorFirstName,
                        doctorLastName:doctorLastName,
                        doctorUID:currentUID,
                        dosage:dosage,
                        expireDate:expireDate,
                        instructions:instructions,
                        issueDate:issueDate,
                        medication:medication,
                        patientAccountEmail:patientEmail,
                        patientFirstName:patientFirstNameFromPatient,
                        patientLastName:patientLastNameFromPatient,
                        patientUID:currPrescriptionFromPatient.patientUID,
                        prescriptionNumber:prescriptionNumber,
                        refills:refills
                      }
                      fetch("/make/validatedPrescription",{
                        method: "POST",
                        cache:"no-cache",
                        body: JSON.stringify(dataToSend)
                      }).then((response) => {
                        console.log(response.status);
                        if(response.status == 201){
                          fetch("/move/patient/pipeline/active",{
                            method:"POST",
                            cache:"no-cache",
                            body: JSON.stringify(prescriptionNumber)
                          })
                          console.log("prescription validated");
                          var sendToDelete = {
                            patientUID:currPrescriptionFromPatient.patientUID,
                            prescriptionNumber: prescriptionNumber
                          };
                          fetch("/delete/patientPrescription",{
                            method:"DELETE",
                            cache:"no-cache",
                            body:JSON.stringify(sendToDelete)
                          }).then((response)=>{
                            console.log(response.status);
                            if(response.status==204){
                              console.log("prescription Deleted from patient Pending Path");
                            }
                          })
                          var sendToDeleteDoctor = {
                            doctorUID:currentUID,
                            prescriptionNumber:prescriptionNumber
                          }
                          fetch("/delete/doctorPrescription",{
                            method:"DELETE",
                            cache:"no-cache",
                            body:JSON.stringify(sendToDeleteDoctor)
                          }).then((response)=>{
                            console.log(response.status);
                            if(response.status == 204){
                              console.log("prescription Deleted from Doctor pending path");
                            }
                          })
                          var sendData = {
                            doctorFirstName: doctorFirstName,
                            doctorLastName: doctorLastName,
                            prescriptionNumber: prescriptionNumber
                          }
                          fetch(`/send/validationEmail?email=${patientEmail}`, {
                            method: "Post",
                            cache: "no-cache",
                            body: JSON.stringify(sendData)
                          }).then((response)=>{
                            console.log(response.status);
                          })
                          window.location.href = "./submitted-prescription-doctor-validated.html";
                        }else{
                          console.log("prescription not validated");
                        }
                      })
                    }else{

                    }
                  }
                }
                console.log("all points do not check out");
                window.location.href = "./submitted-prescription-doctor-wait.html";
              })
            })
        }else{
            console.log("not good :(");
        }
        })
        /**set(ref(db,"doctorPrescriptions/"+foundUSERID+"/"),{
          patientFirstName: patientFirstName.toUpperCase(),
          patientLastName: patientLastName.toUpperCase(),
          dateOfBirth: patientDOB,
          doctorFirstName: doctorFirstName.toUpperCase(),
          doctorLastName: doctorLastName.toUpperCase(),
          doctorEmail: doctorAccountEmail,
          issueDate: issueDate,
          expireDate: expireDate,
          medication: medication.toUpperCase(),
          dosage: dosage,
          refills: refills,
          prescriptionNumber: prescriptionNumber,
          instructions: instructions,
          doctorUID: currentUID
        })*/
        
        }
            }else{
              alert("The prescription number provided is not valid to fill. Please double check the prescription or generate a new prescription number.")
              return;
            }
          })
        })
        
      }
    })
  })
  
})


function checkRefills(refills){
  if(refills==""){
    alert("Refills: is empty.")
    return false;
  }
  var numSet = new Set(["1","2","3","4","5","6","7","8","9","0"]);
  for(let i = 0;i<refills.length;i++){
    if(!numSet.has(refills.charAt(i))){
      alert("Refills must be a valid number");
      return false;
    }
  }
  return true;
}

function checkEmail(email){
  if(email==""){
    alert("Account email: is empty.")
    return false;
  }
  let foundAt = 0;
  let foundPeriod = 0;
  for(let i = 0;i<email.length;i++){
    if(email.charAt(i)=="@"){
      foundAt++;
    }
    if(email.charAt(i)=="."){
      foundPeriod++;
    }
  }
  if(foundPeriod>=1 && foundAt==1){
    return true;
  }else{
    alert("invalid email format");
    return false;
  }
}

function checkName(name){
  if(name==""){
    alert("Name Box: is empty.")
    return false;
  }
  for(let i = 0;i<name.length;i++){
    if(name.charAt(i)==" "){
      alert("There must not be any spaces in any names");
      return false;
    }
  }
  return true;
}

function checkMeasurement(dosage){
  var numSet = new Set(["1","2","3","4","5","6","7","8","9","0"]);
  let hasNonNumber = false;
  for(let i = 0;i<dosage.length;i++){
    if(!numSet.has(dosage.charAt(i))){
      hasNonNumber = true;
    }
  }
  if(hasNonNumber){
    return true;
  }else{
    return false;
  }
}

function checkDate(date){
  if(date==""){
    alert("Date Box: is empty.")
    return false;
  }
  if(date.length<10){
    alert("Date must be in the correct format: MM/DD/YYYY");
    return false;
  }
  if(date.charAt(2)!="/"){
    alert("Date must be in the correct format: MM/DD/YYYY");
    return false;
  }
  if(date.charAt(5)!="/"){
    alert("Date must be in the correct format: MM/DD/YYYY");
    return false;
  }
  
  var numSet = new Set(["1","2","3","4","5","6","7","8","9","0"]);
  for(let i = 0;i<date.length;i++){
    if(i!=2 && i!=5){
      if(!numSet.has(date.charAt(i))){
        alert("Date must only contain numbers and slashes: MM/DD/YYYY");
        return false;
      }
    }
  }
  return true;
}

