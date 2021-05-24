const fs = require("fs");
const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const backup = async (req, res) => {
  const db = makeDb(configuration, res);
  const { client_id } = req.params;
  let $sql;

  try {
    $sql = `select
        id,
        client_id,
        user_id,
        status,
        firstname,
        middlename,
        lastname,
        preferred_name,
        address,
        address2,
        city,
        state,
        postal,
        country,
        phone_home,
        phone_cell,
        phone_work,
        phone_other,
        phone_note,
        email,
        dob,
        ssn,
        gender,
        emergency_firstname,
        emergency_middlename,
        emergency_lastname,
        emergency_relationship,
        emergency_email,
        emergency_phone,
        insurance_name,
        insurance_group,
        insurance_member,
        insurance_phone,
        insurance_desc,
        login_dt,
        primary_reason,
        admin_note,
        medical_note,
        referred_by,
        height,
        waist,
        weight,
        pharmacy_id,
        pharmacy2_id,
        created,
        created_user_id,
        updated,
        updated_user_id
        from patient
        where client_id=${client_id}
        order by 1`;

    const dbResponse = await db.query($sql);

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    fs.writeFile("result.txt", JSON.stringify(dbResponse[0]), (err) => {
      if (err) throw err;
      console.log("File successfully written to disk");
    });
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const Setup = {
  backup,
};

module.exports = Setup;
