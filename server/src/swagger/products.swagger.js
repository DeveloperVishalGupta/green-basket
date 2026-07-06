/**
 * @swagger
 *
 * components:
 *   parameters:
 *     appType:
 *       in: header
 *       name: appType
 *       schema:
 *         type: integer
 *       example: 1
 *       required: true
 *
 *     platform:
 *       in: header
 *       name: platform
 *       schema:
 *         type: integer
 *       example: 2
 *       required: true
 *
 *
 *
 * /api/auth/createStudent/:
 *   post:
 *     summary: Create Student
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 13
 *         description: schoolId Should be in encoded format
 *     tags:
 *       - Student
 *     requestBody:
 *       required: true
 *       description: request body should be in form data format i.e studentData = {below obj here } if files included then files = files1
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"firstName":"ichiro","lastName":"miyata", "rollNo": 10, "admissionNumber":"20240101","userName":"20240101","dob":"2016-11-14","gender":1,
 *                      "password":"123456","className":"9","sectionId":2,"parentsData":[{"parentFirstName":"takamura","parentLastName":"miyata",
 *                      "parentGender":0,"parentEmail":"takamura@gmail.com","parentMobileNumber":"6458789542","parentPassword":"123456"}]}
 *
 *     responses:
 *       '200':
 *         description: Create Student
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Student Created Successfully"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/updateStudent/ :
 *   put:
 *     summary: Update Student
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 12
 *         description: _id Should be in encoded format
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 10
 *         description: schoolId Should be in encoded format
 *     tags:
 *       - Student
 *
 *     requestBody:
 *       required: true
 *       description: request body should be in form data format i.e studentData = {below obj here } if files included then files = files1
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"firstName":"ichiro","lastName":"miyata","admissionNumber":"20240101", "rollNo": 10,
 *                      "userName":"20240101","dob":"2016-11-14","gender":1,"password":"123456","className":"9",
 *                      "sectionId":2,"parentsData":[{"parentFirstName":"takamura","parentLastName":"miyata",
 *                      "parentGender":0,"parentEmail":"takamura@gmail.com","parentMobileNumber":"6458789542","parentPassword":"123456"}]}
 *
 *     responses:
 *       '200':
 *         description: Update Student
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Student Updated Successfully"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/createTeacher/ :
 *   post:
 *     summary: Create Teacher
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 12
 *         description: schoolId Should be in encoded format
 *     tags:
 *       - Teacher
 *
 *     requestBody:
 *       required: true
 *       description: request body should be in form data format i.e teacherData = {below obj here } if files included then files = files1
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"mobile":"7894561478","emergencyNumber":"7841596575","email":"rutu@gmail.com","userName":"rutu_jaaa","password":"123456",
 *                      "firstName":"rutuja","lastName":"pansare","middleName":"anil","gender":1,"dob":"1998-06-14","defaultRole":3,"currentRole":3,
 *                      "classes":["9","10"],"primarySubjectId":274,"secondarySubjectIds":[291]}
 *
 *     responses:
 *       '200':
 *         description: Create Teacher
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Teacher Created Successfully"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/updateTeacher/ :
 *   put:
 *     summary: update Teacher
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 12
 *         description: _id Should be in encoded format
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 20
 *         description: schoolId Should be in encoded format
 *     tags:
 *       - Teacher
 *
 *     requestBody:
 *       required: true
 *       description: request body should be in form data format i.e teacherData = {below obj here } if files included then files = files1
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"mobile":"7894561478","emergencyNumber":"7841596575","email":"rutu@gmail.com","userName":"rutu_jaaa",
 *                      "password":"123456","firstName":"rutuja","lastName":"pansare","middleName":"anil","gender":1,
 *                      "dob":"1998-06-14","defaultRole":3,"currentRole":3,"classes":["9","10"],"primarySubjectId":274,"secondarySubjectIds":[291]}
 *
 *     responses:
 *       '200':
 *         description: update Teacher
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Teacher updated Successfully"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/createManagementUser/ :
 *   post:
 *     summary: create Management User
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 12
 *         description: schoolId Should be in encoded format
 *     tags:
 *       - Management User
 *
 *     requestBody:
 *       required: true
 *       description: request body should be in form data format
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"firstName":"pxel","lastName":"principle","email":"principle@purepixel.com","mobile":"7845621478","userName":"7845621478",
 *                      "password":"123456","role":9,"gender":0,"dob":"1998-11-14","teacherData":{"teacherQualification":1,"defaultRole":2,"currentRole":2,
 *                      "role":2,"classes":["7","8"],"primarySubjectId":248},"coordinatorData":{"role":7,"groupIds":["64a448a3205ba361a449041c"]}}
 *
 *     responses:
 *       '200':
 *         description: create Management User
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"User Created Successfully"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/updateManagementUser/ :
 *   put:
 *     summary: update Management User
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 12
 *         description: _id Should be in encoded format
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 20
 *         description: schoolId Should be in encoded format
 *     tags:
 *       - ManagementUser
 *
 *     requestBody:
 *       required: true
 *       description: request body should be in form data format
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"firstName":"pxel","lastName":"principle","email":"principle@purepixel.com","mobile":"7845621478","userName":"7845621478",
 *                      "password":"123456","role":9,"gender":0,"dob":"1998-11-14","teacherData":{"teacherQualification":1,"defaultRole":2,"currentRole":2,
 *                      "role":2,"classes":["7","8"],"primarySubjectId":248},"coordinatorData":{"role":7,"groupIds":["64a448a3205ba361a449041c"]}}
 *
 *     responses:
 *       '200':
 *         description: update Management User
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"User updated Successfully"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/createOperationTeam :
 *   post:
 *     summary: Create Operation Team
 *     tags:
 *       - Operation team
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: { "email": "Reviewer@gmail.com", "userName": "jen","password": "123456", "mobile": "7506577666",
 *                        "firstName": "jen", "lastName": "doe", "defaultRole": 4,"currentRole": 4,"classes":["6","7"],"secondarySubjectIds":[2,3], "reviewerIds": [821,1591]}
 *
 *     responses:
 *       '200':
 *         description: Create Operation Team
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Opeartion Team Member Created Successfully"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/updateOperationTeam :
 *  put:
 *     summary: update Operation Team
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 12
 *         description: _id Should be in encoded format
 *     tags:
 *       - Operation team
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: { "email": "Reviewer@gmail.com", "userName": "jen","password": "123456", "mobile": "7506577666",
 *                        "firstName": "jen", "lastName": "doe", "defaultRole": 4,"currentRole": 4,"classes":["6","7"],"secondarySubjectIds":[2,3], "reviewerIds": [821,1591] }
 *
 *     responses:
 *       '200':
 *         description: update Operation Team
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Opeartion Team Member Updated Successfully"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 *
 * /api/auth/getAllUserByRole:
 *   get:
 *     summary: Get all user by Role
 *     tags:
 *       - User Roles
 *     parameters:
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: Number
 *         example: 2
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *         example: 208
 *         description: schoolId should be in encoded format
 *       - in: query
 *         name: pageNumber
 *         required: true
 *         schema:
 *           type: Number
 *         example: 1
 *         description: page Number should be in Number format
 *       - in: query
 *         name: searchText
 *         required: false
 *         schema:
 *           type: string
 *         example: vishu
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: Number
 *         example: 10
 *         description: limit should be in number format, limit i.e documents per page
 *       - in: query
 *         name: currentRole
 *         required: false
 *         schema:
 *           type: Number
 *         example: 4/5
 *       - in: query
 *         name: pagination
 *         required: false
 *         schema:
 *           type: String
 *         example: true/false
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *     responses:
 *       '200':
 *         description: Get all user by Role
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               properties:
 *                 data:
 *                   example: { "content": [{"_id": 77,"status": 1,"searchKeywords": ["black widow","9045515964"],"isDeleted": false,"deletedAt": null,
 *                                        "firstName": "black","lastName": "widow","admissionNumber": "07012001","userName": "9045515964","dob": "2001-01-07T00:00:00.000Z",
 *                                        "gender": 1,"password": "$2a$10$s2lUDasXOlw9HLr4K/slCeM8vCW5QbizWDL.HlSVPnhuDLch6V5z2","role": 3,"createdBy": 1,"updatedBy": 1,
 *                                         "schoolId": 68,"createdAt": "2022-12-29T10:40:40.308Z","updatedAt": "2022-12-29T11:31:02.019Z","__v": 0}],
 *                                         "totalCount": 1,"totalPages": 1  }
 *
 *                 code:
 *                  type: number
 *                  example: 200
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 *
 * /api/auth/getAllDeactivatedUserByRole:
 *   get:
 *     summary: Get all deactivated user by Role
 *     tags:
 *       - User Roles
 *     parameters:
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: Number
 *         example: 2
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *         example: 208
 *         description: schoolId should be in encoded format
 *       - in: query
 *         name: pageNumber
 *         required: true
 *         schema:
 *           type: Number
 *         example: 1
 *         description: page Number should be in Number format
 *       - in: query
 *         name: searchText
 *         required: false
 *         schema:
 *           type: string
 *         example: vishu
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: Number
 *         example: 10
 *         description: limit should be in number format, limit i.e documents per page
 *       - in: query
 *         name: pagination
 *         required: false
 *         schema:
 *           type: string
 *         example: false
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *     responses:
 *       '200':
 *         description: Get all deactivated user by Role
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               properties:
 *                 data:
 *                   example: { "content": [{"_id": 77,"status": 1,"searchKeywords": ["black widow","9045515964"],"isDeleted": true,"deletedAt": "2022-12-29T11:31:02.019Z",
 *                                        "firstName": "black","lastName": "widow","admissionNumber": "07012001","userName": "9045515964","dob": "2001-01-07T00:00:00.000Z",
 *                                        "gender": 1,"password": "$2a$10$s2lUDasXOlw9HLr4K/slCeM8vCW5QbizWDL.HlSVPnhuDLch6V5z2","role": 3,"createdBy": 1,"updatedBy": 1,
 *                                         "schoolId": 68,"createdAt": "2022-12-29T10:40:40.308Z","updatedAt": "2022-12-29T11:31:02.019Z","__v": 0}],
 *                                         "totalCount": 1,"totalPages": 1  }
 *
 *                 code:
 *                  type: number
 *                  example: 200
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getAllCountries :
 *   get:
 *     summary: Get all countries
 *     tags:
 *       - Migration Of Country State City
 *
 *     responses:
 *       '200':
 *         description: Get all countries sample 10 documents
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"getAllCountry":[{"text":1,"value":"AFGHANISTAN"},{"text":2,"value":"ALAND ISLANDS"},{"text":3,"value":"ALBANIA"},
 *                        {"text":4,"value":"ALGERIA"},{"text":5,"value":"AMERICAN SAMOA"},{"text":6,"value":"ANDORRA"},{"text":7,"value":"ANGOLA"},
 *                        {"text":8,"value":"ANGUILLA"},{"text":9,"value":"ANTARCTICA"},{"text":10,"value":"ANTIGUA AND BARBUDA"}]},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getAllStates :
 *   get:
 *     summary: Get all states
 *     tags:
 *       - Migration Of Country State City
 *     parameters:
 *       - in: query
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *         example: 100
 *         description: countryId should be in encoded format
 *     responses:
 *       '200':
 *         description: Get all States sample 10 documents
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"getAllState":[{"text":4010,"value":"MANIPUR"},{"text":4030,"value":"GUJARAT"},
 *                        {"text":4022,"value":"UTTAR PRADESH"},{"text":4014,"value":"RAJASTHAN"},{"text":4019,"value":"LAKSHADWEEP"},
 *                        {"text":4013,"value":"ODISHA"},{"text":4036,"value":"MIZORAM"},{"text":4031,"value":"CHANDIGARH"},{"text":4852,"value":"LADAKH"},
 *                        {"text":4017,"value":"ANDHRA PRADESH"},{"text":4026,"value":"KARNATAKA"},{"text":4009,"value":"GOA"},{"text":4028,"value":"KERALA"},
 *                        {"text":4029,"value":"JAMMU AND KASHMIR"},{"text":4008,"value":"MAHARASHTRA"}]},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getAllCities :
 *   get:
 *     summary: Get all Cities
 *     tags:
 *       - Migration Of Country State City
 *     parameters:
 *       - in: query
 *         name: stateId
 *         required: true
 *         schema:
 *           type: string
 *         example: 100
 *         description: stateId should be in encoded format
 *     responses:
 *       '200':
 *         description: Get all Cities sample 10 documents
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"getAllCity":[{"text":134241,"value":"TARAPUR"},{"text":147900,"value":"SHIROL"},{"text":132216,"value":"JALNA"},
 *                        {"text":132403,"value":"KARJAT"},{"text":132844,"value":"MAHABALESHWAR"},{"text":132700,"value":"KANDRI"},{"text":57660,"value":"AMARNATH"},
 *                        {"text":133504,"value":"PUNE"},{"text":133305,"value":"OSMANABAD"},{"text":134100,"value":"TALEGAON DABHADE"},{"text":132359,"value":"KALYAN"},
 *                        {"text":147917,"value":"URULI KANCHAN"},{"text":147870,"value":"PUNTAMBA"},{"text":147806,"value":"MAHIM"}]},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getAppliedLeaves :
 *   get:
 *     summary: Get Applied Leaves
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: Number
 *         example: 1
 *         description: userId should be in encoded format
 *       - in: query
 *         name: schoolId
 *         required: false
 *         schema:
 *           type: Number
 *         example: 208
 *         description: schoolId should be in encoded format
 *       - in: query
 *         name: groupId
 *         required: false
 *         schema:
 *           type: Number
 *         example: 6447def35fb0db8038c4a505
 *         description: groupId should be in encoded format
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         schema:
 *           type: Number
 *         example: 1
 *         description: page Number should be in Number format
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: Number
 *         example: 10
 *         description: limit should be in number format, limit i.e documents per page
 *       - in: query
 *         name: getCancelledLeave
 *         required: false
 *         schema:
 *           type: String
 *         example: true
 *         description: getCancelledLeave should be in string format, it is required when you want to get cancelled leave
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: Number
 *         example: 1/2
 *         description: type should be in Number format, it is required when you want to filter  leave by type
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *         example: 2024-01-09
 *         description: startDate should be in String format, it is required when you want to filter  leave by startDate and enDate
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *         example: 2024-01-13
 *         description: endDate should be in String format, it is required when you want to filter  leave by startDate and enDate
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: string
 *         example: 2024
 *         description: year should be in String format, it is required when you want to filter  leave by year
 *       - in: query
 *         name: leavesHistory
 *         required: false
 *         schema:
 *           type: string
 *         example: true or false
 *         description: leavesHistory should be in String format, if leaveHistory true then it will filter past leaves, if its false it filter present and future leaves
 *       - in: query
 *         name: allowCancellableLeaves
 *         required: false
 *         schema:
 *           type: string
 *         example: false
 *         description: allowCancellableLeaves should be in String format, if its false it filter present and future leaves not filtered cancelled leaves
 *     tags:
 *       - Apply Leaves
 *
 *     responses:
 *       '200':
 *         description: Get Applied Leaves
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"content":[{"_id":81,"status":1,"isDeleted":false,"deletedAt":null,"schoolId":{"_id":208,"firstName":"Rayan12"},
 *                        "userId":{"_id":239,"firstName":"devolina","lastName":"ssdfsdfdsfds"},"startDate":"2023-07-20T00:00:00.000Z","endDate":"2023-07-20T00:00:00.000Z",
 *                        "createdBy":239,"updatedBy":239,"reason":"going to shopping with husband","groupId":"6447def35fb0db8038c4a505"}],"totalCount":1},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/applyLeaves:
 *   post:
 *     summary: Apply Leaves
 *     tags:
 *       - Apply Leaves
 *
 *     requestBody:
 *       required: true
 *       description: leaveAccessType is Limited Period then only it requires otherwise this key is optional
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"type":1,"leaveSelectionMode":1,"startDate":"2024-03-20","endDate":"2024-03-20","reason":"Apply leave after periods",
 *                      "leaveAccessType":2,"leaveAfterPeriods":[1,2,3]}
 *     responses:
 *       '200':
 *         description: Apply Leaves
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Leave applied successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getSchools:
 *   get:
 *     summary: Get all Schools
 *     tags:
 *       - School
 *     parameters:
 *       - in: query
 *         name: subRole
 *         schema:
 *           type: Number
 *         example: 0/1
 *         description: query should be in Number format
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         schema:
 *           type: Number
 *         example: 1
 *         description: page Number should be in Number format
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: Number
 *         example: 10
 *         description: limit should be in number format, limit i.e documents per page
 *       - in: query
 *         name: searchText
 *         schema:
 *           type: string
 *         example: "ryan"
 *         description: searchText should be in string format, limit i.e documents per page
 *
 *     responses:
 *       '200':
 *         description: Get all Schools
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"content":[{"_id":60,"status":1,"searchKeywords":["amd normal","amd-normal","amd@gmail.com","9967406620"],
 *                            "isDeleted":false,"deletedAt":"2022-12-29T10:10:14.791Z","firstName":"amd normal","userName":"amd-normal",
 *                            "password":"$2a$10$E/XlJVXGP11lWIeFr86fcOKGW8fwp1FI7fCAGQCbcaG9pCURqhe.i","email":"amd@gmail.com","mobile":"9967406620",
 *                            "address":"11 street,usa","pincode":120152,"defaultRole":0,"currentRole":0,"state":"new york","country":"usa",
 *                            "city":"new york","website":"","studentLimit":100,"acadmicsFrom":"june","acadmicsTo":"may",
 *                            "licenseStart":"2023-01-01T00:00:00.000Z","licenseEnd":"2024-01-01T00:00:00.000Z","role":1,"createdBy":{"_id":1,"firstName":"Super",
 *                            "lastName":"Admin"},"updatedBy":1,"createdAt":"2022-12-28T10:11:13.210Z","updatedAt":"2023-03-11T13:51:16.190Z","__v":0},
 *                            {"_id":68,"status":1,"searchKeywords":["intel normal school","intel-normal","intel@gmail.com","9967406123"],"isDeleted":false,
 *                            "deletedAt":null,"firstName":"intel normal school","userName":"intel-normal",
 *                            "password":"$2a$10$io0IIyek9aDzYXKow9OGQOmB0gPlzCsFNcupFOKNGy2c1QWTrVyPq","email":"intel@gmail.com","mobile":"9967406123",
 *                            "address":"11 street,usa","pincode":120152,"defaultRole":0,"currentRole":0,"state":"new york","country":"usa","city":"new york",
 *                            "website":"","studentLimit":100,"acadmicsFrom":"june","acadmicsTo":"may","licenseStart":"2023-01-01T00:00:00.000Z",
 *                            "licenseEnd":"2024-01-01T00:00:00.000Z","chainSchoolId":67,"role":1,"createdBy":{"_id":1,"firstName":"Super","lastName":"Admin"},
 *                            "updatedBy":1,"createdAt":"2022-12-29T10:16:45.412Z","updatedAt":"2022-12-29T10:16:45.412Z","__v":0}],
 *                            "totalCount":6,"totalPages":3},"code":200,"error":false}
 *
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/createSchool:
 *   post:
 *     summary:  Create School
 *     tags:
 *       - School
 *     parameters:
 *       - in: query
 *         name: chainSchoolId
 *         schema:
 *           type: Number
 *         example: 12
 *         description: chainSchoolId should be in encoded format
 *     requestBody:
 *       required: true
 *       description: request body should be in form data format i.e schoolData = {below obj here } if files included then files = files1
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"schoolName":"new Horizon public school","firstName":"school","lastName":"admin","userName":"9967402845","takeDecision":true,
 *                      "email":"horizonschooladmin@gmail.com","password":"123456","schoolPhone":"9819111485","mobile":"9967402845","principalName":"penguin",
 *                      "address":"11 street,hokkaido","pincode":"120103","defaultRole":"0","currentRole":"0","acadamingYear":"2023-2024",
 *                      "availableClasses":["1","2","3","4","5","6","7","8","9","10"],"classes":["1","2","3","4","5","6","7"],"subjectIds":[234,235,236,238,239,240],
 *                      "stateId":853,"countryId":109,"cityId":64200,"website":"","studentLimit":100,"acadmicsFrom":"june","acadmicsTo":"may",
 *                      "affliatedToBoard":"maharashtra state board","academicPeriodFrom":"2023-11-16","academicPeriodTo":"2024-10-16", "displayName": "nhp",
 *                      "licenseStart":"2023-01-01","licenseEnd":"2024-12-31","chainSchoolId":61}
 *     responses:
 *       '200':
 *         description: Create School
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"School Created Successfully"},"code":200,"error":false}
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/updateSchool:
 *   put:
 *     summary:  Update School
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 342
 *         description: _id should be in encoded format
 *       - in: query
 *         name: chainSchoolId
 *         required: false
 *         schema:
 *           type: Number
 *         example: 12
 *         description: chainSchoolId should be in encoded format
 *     tags:
 *       - School
 *     requestBody:
 *       required: true
 *       description: request body should be in form data format i.e schoolData = {below obj here } if files included then files = files1
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"schoolName":"new Horizon public school","firstName":"school","lastName":"admin","userName":"9967402845","takeDecision":true,
 *                      "email":"horizonschooladmin@gmail.com","password":"123456","schoolPhone":"9819111485","mobile":"9967402845","principalName":"penguin",
 *                      "address":"11 street,hokkaido","pincode":"120103","defaultRole":"0","currentRole":"0","acadamingYear":"2023-2024",
 *                      "availableClasses":["1","2","3","4","5","6","7","8","9","10"],"classes":["1","2","3","4","5","6","7"],"subjectIds":[234,235,236,238,239,240],
 *                      "stateId":853,"countryId":109,"cityId":64200,"website":"","studentLimit":100,"acadmicsFrom":"june","acadmicsTo":"may",
 *                      "affliatedToBoard":"maharashtra state board","academicPeriodFrom":"2023-11-16","academicPeriodTo":"2024-10-16",
 *                      "licenseStart":"2023-01-01","licenseEnd":"2024-12-31","chainSchoolId":61}
 *     responses:
 *       '200':
 *         description: Update School
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"School Updated Successfully"},"code":200,"error":false}
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/deleteUser :
 *  delete:
 *     summary: Delete User
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 12
 *         description: _id Should be in encoded format
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: Number
 *         example: 12
 *         description: role Should be in Number format
 *       - in: query
 *         name: schoolId
 *         required: false
 *         schema:
 *           type: Number
 *         example: 12
 *         description: schoolId Should be in encoded format
 *     tags:
 *       - Delete User
 *
 *     responses:
 *       '200':
 *         description: Delete User
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"User deleted successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/permanentDeleteUser :
 *  delete:
 *     summary: Permanent delete User
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 12
 *         description: _id Should be in encoded format
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: Number
 *         example: 12
 *         description: role Should be in Number format
 *       - in: query
 *         name: schoolId
 *         required: false
 *         schema:
 *           type: Number
 *         example: 12
 *         description: schoolId Should be in encoded format
 *     tags:
 *       - Delete User
 *
 *     responses:
 *       '200':
 *         description: Permanent delete User
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"User deleted permanently successful"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/resetPassword :
 *  put:
 *     summary: Reset user password
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 12
 *         description: _id Should be in encoded format
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: Number
 *         example: 12
 *         description: role Should be in Number format
 *       - in: query
 *         name: schoolId
 *         required: false
 *         schema:
 *           type: Number
 *         example: 12
 *         description: schoolId Should be in encoded format
 *     tags:
 *       - Reset password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"password": "123456"}
 *
 *     responses:
 *       '200':
 *         description: Reset user password
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Password reset successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getParent :
 *   get:
 *     summary: Get parent details
 *     tags:
 *       - Parent
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         example: vashuchaudhary@gmail.com
 *         description: email Should be in string format
 *
 *     responses:
 *       '200':
 *         description: Get parent details
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"_id":412,"firstName":"yuvraj","lastName":"singh rawal","gender":0,"userName":"yuvrajsinghrawal@gmail.com",
 *                                 "mobile":"1000000035","role":5},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/studentProfilePopup :
 *   get:
 *     summary:  Get Student profile Popup
 *     tags:
 *       - Student
 *
 *     responses:
 *       '200':
 *         description: Get Student profile Popup the error message pop when student details like dob parentDetails and gender is not provided else it returns true
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Your profile is incomplete! Please update your profile"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getContributersFromReviwerMapping :
 *   get:
 *     summary:  Get contributers From Reviwer Mapping classes and subjects
 *     tags:
 *       - Operation team
 *
 *     responses:
 *       '200':
 *         description: Get contributers From Reviwer Mapping classes and subjects
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":[{"_id":769,"firstName":"manpreet", "lastName": "kaur", "email": "manpreetkmps@gmail.com"}],"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/createTrainerUser :
 *   post:
 *     summary: Create Trainer User for vachak mitra, to train data
 *     tags:
 *       - Vachak Mitra User
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"firstName":"vachakMitraTrainer","lastName":"user","email":"trainer@vachakmitra.com","password":"123456","gender":0}
 *
 *     responses:
 *       '200':
 *         description: Create Trainer User for vachak mitra, to train data
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"User created successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/updateTrainerUser:
 *   put:
 *     summary: Update Trainer User for vachak mitra, to train data
 *     tags:
 *       - Vachak Mitra User
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"firstName":"vachakMitraTrainer","lastName":"user","email":"trainer@vachakmitra.com","password":"123456","gender":0}
 *
 *     responses:
 *       '200':
 *         description: update Trainer User for vachak mitra, to train data
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"User updated successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/promoteSchoolToNextYear:
 *   post:
 *     summary: Promote School To Next Year
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 1283
 *         description: schoolId Should be in encoded format
 *       - in: query
 *         name: academicYear
 *         required: true
 *         schema:
 *           type: Stirng
 *         example: 2024-2025
 *         description: academicYear Should be in string format
 *     tags:
 *       - Promote School
 *     responses:
 *       '200':
 *         description: Promote School To Next Year
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"User promoted successfully!"},"code":200,"error":false}
 *
 * /api/auth/moveUserToAnotherSchool:
 *   post:
 *     summary: Move user to another school
 *     parameters:
 *       - in: query
 *         name: newSchoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 1283
 *         description: newSchoolId Should be in encoded format
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 193
 *         description: userId Should be in encoded format
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: Number
 *         example: 2/3
 *         description: role Should be in number format
 *     tags:
 *       - Move user to another school
 *     responses:
 *       '200':
 *         description: Move user to another school
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"school changed successfully!"},"code":200,"error":false}
 *
 * /api/auth/getUserDeactivatedRequest:
 *   get:
 *     summary: Get User Deactivated Request
 *     parameters:
 *       - in: query
 *         name: currentSchoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 1283
 *         description: currentSchoolId Should be in encoded format
 *     tags:
 *       - Move user to another school
 *     responses:
 *       '200':
 *         description: Get User Deactivated Request
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"_id":5,"isDecativated":false,"isDeleted":false,"deletedAt":null,"newSchoolId":1283,
 *                        "currentSchoolId":208,"userId":1172,"role":2,"createdBy":1283,"updatedBy":1283,
 *                        "createdAt":"2023-07-13T07:16:11.019Z","updatedAt":"2023-07-13T07:46:21.088Z","__v":0},"code":200,"error":false}
 *
 * /api/auth/getUserDeactivationCompletedRequest:
 *   get:
 *     summary: Get User Deactivation Completed Request
 *     parameters:
 *       - in: query
 *         name: newSchoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 1283
 *         description: newSchoolId Should be in encoded format
 *     tags:
 *       - Move user to another school
 *     responses:
 *       '200':
 *         description: Get User Deactivation Completed Request
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":[{"_id":6,"isDecativated":true,"isDeleted":false,"deletedAt":null,"newSchoolId":1283,
 *                        "currentSchoolId":208,"userId":1172,"role":2,"createdBy":1283,"updatedBy":1283,"createdAt":{"$date":"2023-07-13T12:33:14.421Z"},
 *                        "updatedAt":{"$date":"2023-07-13T12:33:55.064Z"},"__v":0,"decativatedUsers":[{"_id":1172,"firstName":"emma","lastName":"ken","schoolId":1283}]}],
 *                        "code":200,"error":false}
 *
 * /api/auth/createCoordinator:
 *   post:
 *     summary: create Coordinator
 *     tags:
 *       - Coordinator
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"firstName":"coordinator3","email":"coordinator3@gmail.com","mobile":"7845623148",
 *                      "userName":"7845623148","password":"123456","dob":"1995-08-22","groupIds":["6447def35fb0db8038c4a506"]}
 *     responses:
 *       '200':
 *         description: create Coordinator
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Coordinator created successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/updateCoordinator:
 *   put:
 *     summary: update Coordinator
 *     tags:
 *       - Coordinator
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 1467
 *         description: _id Should be in encoded format
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"firstName":"coordinator3","lastName":"coordinator1lastName","email":"coordinator3@gmail.com","mobile":"7845623148",
 *                      "userName":"7845623148","password":"123456","dob":"1995-08-22","groupIds":["6447def35fb0db8038c4a506"]}
 *     responses:
 *       '200':
 *         description: update Coordinator
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Coordinator updated successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getAllCoordinators:
 *   get:
 *     summary: Get All Coordinators
 *     tags:
 *       - Coordinator
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 208
 *         description: schoolId Should be in encoded format
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         schema:
 *           type: Number
 *         example: 1
 *         description: pageNumber Should be in Number format
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: Number
 *         example: 10
 *         description: limit Should be in Number format
 *       - in: query
 *         name: searchText
 *         required: false
 *         schema:
 *           type: String
 *         example: coordinateer1
 *         description: searchText Should be in string format
 *
 *     responses:
 *       '200':
 *         description: Get All Coordinators
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"content":[{"_id":1469,"status":1,"groupIds":["6447def35fb0db8038c4a506"],
 *                        "searchKeywords":["coordinator3","7845623148","coordinator3@gmail.com","7845623148"],
 *                        "isDeleted":false,"deletedAt":null,"firstName":"coordinator3","email":"coordinator3@gmail.com",
 *                        "mobile":"7845623148","userName":"7845623148","password":"123456","dob":"1995-08-22T00:00:00.000Z",
 *                        "createdBy":208,"updatedBy":208,"schoolId":{"_id":208,"firstName":"Rayan12"},"role":7,"createdAt":"2023-07-22T08:17:30.372Z",
 *                        "updatedAt":"2023-07-22T08:17:30.372Z","__v":0}],"totalCount":3,"totalPages":3},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/teacherSubjectClassMapping:
 *   put:
 *     summary: Teacher Subject Class Mapping
 *     tags:
 *       - Teacher Subject Class Mapping
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 1283
 *         description: schoolId Should be in encoded format
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"teacherSubjectClassMapping":[{"teacherId":1549,"classes":["2","3"],"primarySubjectId":277,"secondarySubjectIds":[245]},
 *                      {"teacherId":1548,"classes":["4","3"],"primarySubjectId":239,"secondarySubjectIds":[531]},{"teacherId":1547,"classes":["5","6"],
 *                      "primarySubjectId":247},{"teacherId":1546,"classes":["5","6"],"primarySubjectId":420,"secondarySubjectIds":[249]},{"teacherId":1545,
 *                      "classes":["7","8"],"primarySubjectId":248},{"teacherId":1545,"classes":["9","8"],"primarySubjectId":236}]}
 *     responses:
 *       '200':
 *         description: Teacher Subject Class Mapping
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Teachers classes and subjects updated successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/refreshToken:
 *   post:
 *     summary: Refresh Token
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 802
 *         description: _id Should be in encoded format
 *     tags:
 *       - Token
 *
 *     responses:
 *       '200':
 *         description: Refresh Token
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
 *                         eyJfaWQiOjgwMiwiaXNEZWxldGVkIjpmYWxzZSwicGFzc3dvcmQiOiIkMmEkMTAkNEIwOFdvYy5yRGEwaldvem
 *                        5zWTJmdWRJVXpRZXpUbnN4Ym92TDg1a0VITkxET2swQm5TcE8iLCJhY2FkYW1pbmdZZWFyIjoiMjAyMy0yMDI0IiwibGljZW5zZUVuZCI6IjIwMjMtMTItMzFUMjM6NTk6NTku
 *                        MDAwWiIsImN1cnJlbnRSb2xlIjowLCJkZWZhdWx0Um9sZSI6MCwicm9sZSI6MSwibG9naW5BdCI6IjIwMjMtMDUtMDNUMTI6MDk6MTAuNzcyWiIsInVzZXJJZCI6ODAyLCJ1c2VyQWdlbnQiOiJQb
 *                        3N0bWFuUnVudGltZS83LjM1LjAiLCJpYXQiOjE3MDA0NjU0NjMsImV4cCI6MTcwMDcyNDY2M30.SMx-TaVFS2aklykPHdul5J_x4IeQQcJOFVK5LENSfdg",
 *                        "message":"Token refresh successfully"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/cancelLeave :
 *   put:
 *     summary: cancel Leave
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: String
 *         example: 197
 *         description: _id should be in encoded format
 *     tags:
 *       - Apply Leaves
 *     requestBody:
 *       required: false
 *       description: this body is required when the teacher or school admin wants to cancel the leave and cancelled the allocated substitute time table
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"cancelledSubstituteTimeTableEntriesOfDay":[{"_id":2852,"timetable":[{"class":"2","sectionId":2,"subjectId":247,"period":3,"startTime":"15:34",
 *                      "endTime":"16:19","isSubstituted":true,"_id":"6784b6902d6ac4b1de9ad7e5"}]},{"_id":2851,"timetable":[{"class":"1","sectionId":2,"subjectId":247,"period":2,
 *                      "startTime":"14:47","endTime":"15:32","isSubstituted":true,"_id":"6784b6902d6ac4b1de9ad7d8"}]}]}
 *     responses:
 *       '200':
 *         description: cancel Leave
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Leave cancelled successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/createOrUpdateStudentAttendance :
 *   post:
 *     summary: create Or Update Student Attendance
 *     tags:
 *       - Student Attendance
 *     requestBody:
 *       required: true
 *       description: subjectId and period is required only when attendanceType is Subjectwise
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"class":"6","sectionId":2,"schoolId":802,"attendanceDate":"2024-03-07","attendanceType":2,
 *                      "subjectId":248,"period":3,"attendance":[{"studentId":997,"status":1},{"studentId":343,"status":2}]}

 *     responses:
 *       '200':
 *         description: create Or Update Student Attendance
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Attnedance marked successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 *
 * /api/auth/getStudentDetailsFromTeacherLogin :
 *   get:
 *     summary: get Student Details From Teacher Login
 *     tags:
 *       - Student Attendance
 *     parameters:
 *       - in: query
 *         name: className
 *         required: true
 *         schema:
 *           type: String
 *         example: 9
 *         description: className should be in string format
 *       - in: query
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 2
 *         description: sectionId should be in encoded format
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         schema:
 *           type: Number
 *         example: 1
 *         description: pageNumber should be in number format
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: Number
 *         example: 10
 *         description: limit should be in number format
 *       - in: query
 *         name: pagination
 *         required: false
 *         schema:
 *           type: string
 *         example: false
 *         description: pagination should be in string format
 *     responses:
 *       '200':
 *         description: get Student Details From Teacher Login
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":[{"_id":54,"status":1,"schoolId":802,"acadamingYear":"2023-2024","mappingObjects":{"class":"6","sectionId":2,"_id":"6571e3367682847fe010f6bc"},
 *                        "userId":{"_id":343,"firstName":"aarohi","lastName":"doe"},"role":3,"groupId":"64520ecafd71b75f6ba3c0c4"},{"_id":364,"status":1,"schoolId":802,
 *                        "acadamingYear":"2023-2024","mappingObjects":{"class":"6","sectionId":2,"_id":"64958db146beac562c32ccb6"},"userId":{"_id":997,"firstName":"peter",
 *                        "lastName":"parker"},"role":3,"groupId":"64520ecafd71b75f6ba3c0c4"}],"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getStudentAttendance :
 *   get:
 *     summary: get Student Attendance
 *     tags:
 *       - Student Attendance
 *     parameters:
 *       - in: query
 *         name: class
 *         required: false
 *         schema:
 *           type: String
 *         example: 9
 *         description: className should be in string format pass when role is school or teacher
 *       - in: query
 *         name: sectionId
 *         required: false
 *         schema:
 *           type: Number
 *         example: 2
 *         description: sectionId should be in encoded format pass when role is school or teacher
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *         example: 2024-03-06
 *         description: startDate should be in string format
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *         example: 2024-03-07
 *         description: endDate should be in string format
 *       - in: query
 *         name: attendanceStatus
 *         required: false
 *         schema:
 *           type: Number
 *         example: 1/2/3 1-present 2-absent 3-leave
 *         description: attendanceStatus should be in number format
 *       - in: query
 *         name: teacherId
 *         required: false
 *         schema:
 *           type: Number
 *         example: 814
 *         description: teacherId should be in encoded format , pass when role is school and want to filter by teacher id
 *     responses:
 *       '200':
 *         description: get Student Attendance
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":[{"_id":9,"class":"6","sectionId":{"_id":2,"sectionName":"A"},"schoolId":{"_id":802,
 *                        "firstName":"modern school vashi","schoolName":"vms"},"createdAt":"2024-03-07T06:10:57.199Z",
 *                        "createdBy":{"_id":814,"firstName":"sonam","lastName":"garg"},"attendance":[{"studentId":{"_id":997,"firstName":"peter",
 *                        "lastName":"parker"},"status":2,"_id":"65e95a714f417965e040a288"},{"studentId":{"_id":343,"firstName":"aarohi","lastName":"doe"},
 *                        "status":1,"_id":"65e95a714f417965e040a289"}]}],"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/saveModuleAccessControl :
 *   post:
 *     summary: save Module Access Control
 *     tags:
 *       - Module Access Control
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: false
 *         schema:
 *           type: Number
 *         example: 9
 *         description: _id should be encoded format its required when you want to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"rules":[{"ruleId":1,"value":1,"specifyTo":1,"specifyToIds":["64a44860205ba361a4490408","64a448a3205ba361a449041c"],"_id":"65efecd78722f5268c745fae"},
 *                      {"ruleId":1,"value":1,"specifyTo":1,"specifyToIds":["64a448a3205ba361a449041c"]}]}

 *     responses:
 *       '200':
 *         description: save Module Access Control
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Module access controls saved successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getModuleAccessControl:
 *   get:
 *     summary: get Module Access Control
 *     tags:
 *       - Module Access Control
 *     responses:
 *       '200':
 *         description: get Module Access Control
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":[{"_id":3,"rules":[{"specifyToIds":["64a44860205ba361a4490408"],"ruleId":1,"value":1,"specifyTo":1,
 *                         "_id":"65ef1eff820b96219c73e928"}]}],"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getModuleAccessControlConstraints:
 *   get:
 *     summary: get Module Access Control Constraints
 *     tags:
 *       - Module Access Control
 *     responses:
 *       '200':
 *         description: get Module Access Control Constraints
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":[{"_id":1,"title":"Teacher Attendance Mode","ruleType":1,"specifyTo":1,
 *                         "options":[{"title":"Once in a day","value":"1"},{"title":"On each period","value":"2"}]},
 *                        {"_id":2,"title":"Student Feedback","ruleType":1,"specifyTo":2,"options":[{"title":"Yes","value":"1"},
 *                        {"title":"No","value":"2"}]}],"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/saveProductEnquiry:
 *   post:
 *     summary: Save Product Enquiry
 *     tags:
 *       - Product Enquiry
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"fullName":"mahatma school","email":"mahatmaSchool@gmail.com","message":"We would like to see the product demo"}
 *     responses:
 *       '200':
 *         description: Save Product Enquiry
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Enquiry saved successfully!"},"code":200,"error":false}
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 *
 * /api/auth/getProductEnquiries:
 *   get:
 *     summary: Get Product Enquiries
 *     tags:
 *       - Product Enquiry
 *     responses:
 *       '200':
 *         description: Get Product Enquiries
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":[{"_id":1,"status":1,"fullName":"akash kadam",
 *                        "email":"akash@gmail.com","message":"We would like to see th product demo","createdBy":1,"updatedBy":1,
 *                        "createdAt":"2024-03-21T10:34:20.148Z"},{"_id":2,"status":1,"fullName":"mahatma school",
 *                        "email":"mahatmaSchool@gmail.com","message":"We would like to see th product demo","createdBy":1,"updatedBy":1,
 *                        "createdAt":"2024-03-21T10:35:44.924Z"}],"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getGroupReport:
 *   get:
 *     summary: Get Group Report
 *     tags:
 *       - Group Report
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 1283
 *         description: schoolId should be encoded format
 *     responses:
 *       '200':
 *         description: Get Group Report
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":[{"_id":"64a44860205ba361a4490408","groupName":"SECONDARY","classes":["9","10"],
 *                        "groupId":"64a44860205ba361a4490408","schoolId":1283,"coordinatorDetail":{"_id":1592,"groupIds":["64a44860205ba361a4490408"],
 *                        "firstName":"vishal","lastName":"coordinator"},"classWiseSections":[{"class":"10","sections":[{"_id":{"_id":2,"sectionName":"A"},
 *                        "totalStudentsInThisSection":2,"classTeacher":{"_id":1544,"firstName":"diksha","lastName":"gaikwad"}}],"totalStudents":2},
 *                        {"class":"9","sections":[{"_id":{"_id":2,"sectionName":"A"},"totalStudentsInThisSection":3,
 *                        "classTeacher":{"_id":1288,"firstName":"akash","lastName":"kadam"}},{"_id":{"_id":3,"sectionName":"B"},
 *                        "totalStudentsInThisSection":1,"classTeacher":{"_id":1287,"firstName":"kajal","lastName":"rangari"}}],"totalStudents":4}]}],"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/createUserPermission:
 *   post:
 *     summary: create User Permission
 *     tags:
 *       - User Permission
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"role":2,"permissions":[{"permissionType":2,"moduleType":1},{"permissionType":2,"moduleType":2},{"permissionType":2,
 *                      "moduleType":4},{"permissionType":1,"moduleType":17},{"permissionType":1,"moduleType":18},{"permissionType":1,"moduleType":19}]}
 *     responses:
 *       '200':
 *         description: create User Permission
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Permission created successfully!"},"code":200,"error":false}
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/updateUserPermission :
 *   put:
 *     summary: update User Permission
 *     tags:
 *       - User Permission
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 2
 *         description: _id should be encoded format
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"permissions":[{"permissionType":1,"moduleType":18,"_id":"6644a0dad696fc3290f2aed4"},{"permissionType":1,"moduleType":20}]}

 *     responses:
 *       '200':
 *         description: update User Permission
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Permission updated successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getUserPermissions :
 *   get:
 *     summary: get User Permissions
 *     tags:
 *       - User Permission
 *     parameters:
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: Number
 *         example: 2
 *         description: role should be number format
 *       - in: query
 *         name: permissionType
 *         required: false
 *         schema:
 *           type: Number
 *         example: 1/2
 *         description: permissionType should be number format
 *       - in: query
 *         name: moduleType
 *         required: false
 *         schema:
 *           type: Number
 *         example: 1
 *         description: moduleType should be number format
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: Number
 *         example: 1
 *         description: userId should be encoded format

 *     responses:
 *       '200':
 *         description: get User Permissions
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":[{"_id":3,"role":2,"permissions":[{"permissionType":1,"moduleType":2}],
 *                        "schoolId":{"_id":1283,"firstName":"pure pixel","displayName":"PXEL","lastName":"admin"},"userId":{"_id":1288,"firstName":"akash","lastName":"kadam"}}],
 *                         "code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 *
 * /api/auth/createRelationshipManger :
 *   post:
 *     summary: create Relationship Manger
 *     tags:
 *       - Relationship Manger
 *
 *     requestBody:
 *       required: true
 *       description: add role 12 if you want to create Rm else role 14 for workshop head
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"email":"userManager@tailwnd.com","userName":"84578964561","password":"123456","mobile":"84578964561", "role": 12,
 *                      "firstName":"Tailwnd User","lastName":"Manager","mappedSchoolIds":[2381,1283]}
 *     responses:
 *       '200':
 *         description: create Relationship Manger
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Relationship manager created successfully"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 *
 * /api/auth/updateRelationshipManger :
 *  put:
 *     summary: update Relationship Manger
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 12
 *         description: _id Should be in encoded format
 *     tags:
 *       - Relationship Manger
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"email":"userManager@tailwnd.com","userName":"84578964561","password":"123456","mobile":"84578964561",
 *                      "firstName":"Tailwnd User","lastName":"Manager","mappedSchoolIds":[2381,1283]}
 *
 *     responses:
 *       '200':
 *         description: update Relationship Manger
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"profile updated successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/createSchoolLicenseHistory:
 *   post:
 *     summary: create School License History
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 13
 *         description: schoolId Should be in encoded format
 *     tags:
 *       - School License details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"configuration":[{"userRole":3,"adsenceType":2,"classes":["1","2","3","4","5","6","7","8"]},{"userRole":2,"adsenceType":2,"classes":["6","7","8"]}]}
 *
 *     responses:
 *       '200':
 *         description: create School License History
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"License details saved successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 *
 * /api/auth/updateSchoolLicenseHistory:
 *   put:
 *     summary: update School License History
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 13
 *         description: _id Should be in encoded format
 *     tags:
 *       - School License details
 *
 *     responses:
 *       '200':
 *         description: update School License History
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"License details updated successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 *
 * /api/auth/deleteSchoolLicenseHistory:
 *   delete:
 *     summary: delete School License History
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: Number
 *         example: 13
 *         description: _id Should be in encoded format
 *     tags:
 *       - School License details
 *
 *     responses:
 *       '200':
 *         description: delete School License History
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"License details delete successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 *
 * /api/auth/getSchoolLicenseHistory:
 *   get:
 *     summary: Get School License History
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 13
 *         description: schoolId Should be in encoded format
 *       - in: query
 *         name: academicYear
 *         required: false
 *         schema:
 *           type: String
 *         example: 2024-2025
 *         description: academicYear Should be in string format
 *       - in: query
 *         name: pagination
 *         required: false
 *         schema:
 *           type: String
 *         example: false
 *         description: pagination Should be in string format
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         schema:
 *           type: Number
 *         example: 1
 *         description: pageNumber Should be in number format
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: Number
 *         example: 10
 *         description: limit Should be in number format
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: Number
 *         example: 2
 *         description: role Should be in number format
 *       - in: query
 *         name: adsenceType
 *         required: false
 *         schema:
 *           type: Number
 *         example: 1/2 1 - paid user 2 - pilot user
 *         description: adsenceType Should be in string format
 *     tags:
 *       - School License details
 *     responses:
 *       '200':
 *         description: get School License History
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"content":[{"_id":6,"schoolId":{"_id":4,"licenseStart":"2023-07-14T00:00:00.000Z","firstName":"demo school",
 *                        "licenseEnd":"2026-03-31T23:59:59.000Z","displayName":"demoschool","lastName":"admin"},"createdAt":"2025-06-04T11:27:21.941Z",
 *                        "configuration":[{"userRole":3,"adsenceType":2,"classes":["1","2","3","4","5","6","7","8"],"_id":"68402d9955b459998222d7a7"}]}],
 *                        "totalCount":1,"totalPages":1},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 *
 * /api/auth/getLoggedUserReport:
 *   get:
 *     summary: Get Logged User Report
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: Number
 *         example: 1783
 *         description: schoolId Should be in encoded format
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         example: ar
 *         description: name Should be in string format
 *       - in: query
 *         name: className
 *         required: false
 *         schema:
 *           type: string
 *         example: 7
 *         description: className Should be in string format
 *       - in: query
 *         name: sectionName
 *         required: false
 *         schema:
 *           type: string
 *         example: A
 *         description: sectionName Should be in string format
 *       - in: query
 *         name: getLoggedUsers
 *         required: true
 *         schema:
 *           type: string
 *         example: true false
 *         description: getLoggedUsers Should be in string format
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: Number
 *         example: 2 3
 *         description: role Should be in number format
 *       - in: query
 *         name: userCount
 *         required: true
 *         schema:
 *           type: string
 *         example: true
 *         description: userCount Should be in string format
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *         example: 2025-02-14
 *         description: startDate Should be in string format
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *         example: 2025-02-14
 *         description: endDate Should be in string format
 *     tags:
 *       - Logged User Report
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"loggedUserIds":"[1784, 1785]"}
 *     responses:
 *       '200':
 *         description: Get Logged User Report
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":[{"notLoggedInUsersByRole":{"teachers":[],"students":[{"_id":1787,"firstName":"seven",
 *                        "lastName":"two","role":3,"loginAt":"2025-03-21T07:54:40.231Z","roleType":"students"},{"_id":1789,
 *                        "firstName":"eight","lastName":"three","role":3,"loginAt":"2025-03-06T11:09:07.372Z","roleType":"students"}]},
 *                        "loggedInUsersByRole":{"teachers":[{"_id":1784,"firstName":"ar","lastName":"teacher","role":2,
 *                        "loginAt":"2025-03-03T12:37:50.055Z","roleType":"teachers"}],"students":[{"_id":1785,"firstName":"six","
 *                        lastName":"one","role":3,"loginAt":"2025-03-21T08:34:47.255Z","roleType":"students"}]}}],"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/submitStudentConsentForm:
 *   put:
 *     summary: submit Student Consent Form
 *     tags:
 *       - Consent Form
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"macAddress":"00-B0-D0-63-C2-26","ipAddress":"92.168. 123.132","userAgent":"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N)
 *                      AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36","lattitude":"18.990778251373065","longitude":"73.11767655005904"}
 *     responses:
 *       '200':
 *         description: submit Student Consent Form
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Concent form submitted successfully!"},"code":200,"error":false}
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 *
 * /api/auth/updateLeave :
 *   put:
 *     summary: update Leave
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: String
 *         example: 37
 *         description: _id should be in encoded format
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: String
 *         example: 2025-06-03
 *         description: startDate should be in string format
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: String
 *         example: 2025-06-04
 *         description: endDate should be in encoded format
 *     tags:
 *       - Apply Leaves
 *     requestBody:
 *       required: false
 *       description: this body is required when the teacher or school admin wants to cancel the leave and cancelled the allocated substitute time table
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {"cancelledSubstituteTimeTableEntriesOfDay":[{"_id":77,"currentDate":"2025-06-04",
 *                      "timetable":[{"class":"6","sectionId":2,"subjectId":8,"period":3,"startTime":"10:20","endTime":"11:00",
 *                      "isSubstituted":true,"_id":"68380972ed575b1e2dbc8892"}]},{"_id":70,"currentDate":"2025-06-03","timetable":[{"class":"8","sectionId":5,"subjectId":14,
 *                      "period":3,"startTime":"10:20","endTime":"11:00","isSubstituted":true,"_id":"6838094eed575b1e2dbc8818"}]}]}
 *     responses:
 *       '200':
 *         description: update Leave
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Leave updated successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/createOrUpdateUserViewAdsHistory:
 *   post:
 *     summary: create Or Update User View Ads History
 *     tags:
 *       - User Adsence
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:  {"viewAds":[{"type":4,"config":{"value":2}}]}
 *
 *     responses:
 *       '200':
 *         description: create Or Update User View Ads History
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"message":"Data created successfully!"},"code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 * /api/auth/getUserViewAdsHistory:
 *   get:
 *     summary: Get User View Ads History
 *     parameters:
 *       - in: query
 *         name: pagination
 *         required: false
 *         schema:
 *           type: String
 *         example: false
 *         description: pagination Should be in string format
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         schema:
 *           type: Number
 *         example: 1
 *         description: pageNumber Should be in number format
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: Number
 *         example: 6
 *         description: limit Should be in number format
 *     tags:
 *       - User Adsence
 *
 *     responses:
 *       '200':
 *         description: Get User View Ads History
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               example: {"data":{"content":[{"_id":2,"userId":1918,"viewAds":[{"type":3,"config":{"value":1},"_id":"685187cb52896db7a1eb2a79"},
 *                        {"type":4,"config":{"value":2},"_id":"685187ee52896db7a1eb2a80"}],"createdAt":"2025-06-17T15:20:44.367Z"},{"_id":1,
 *                        "userId":1918,"viewAds":[{"type":2,"config":{"value":20},"_id":"6851874552896db7a1eb2a6a"},{"type":1,
 *                        "config":{"multipleOf":1.5},"_id":"6851877b52896db7a1eb2a74"}],"createdAt":"2025-06-16T15:18:29.666Z"}],"totalCount":2,"totalPages":1},
 *                        "code":200,"error":false}
 *
 *       '401':
 *         description: UnAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: UnAuthorized
 *
 *
 */
