const moment = require("moment");
const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const getEncounters = async (req, res) => {
  const db = makeDb(configuration, res);
  const { patient_id } = req.params;

  try {
    const dbResponse = await db.query(
      `select e.dt, e.id, e.title, et.name encounter_type, concat(u.firstname, ' ', u.lastname) name, notes, treatment
      from encounter e 
      left join encounter_type et on et.id=e.type_id
      left join user u on u.id=e.user_id
      where e.client_id=${req.client_id}
      and e.patient_id=${patient_id}
      order by e.dt desc
      limit 50`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getEncountersPrescriptions = async (req, res) => {
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select d.name, d.id, pd.expires, pd.generic, pd.drug_frequency_id, pd.amount, pd.refills, pd.start_dt, pd.patient_instructions, pd.pharmacy_instructions,
      concat(ds.strength, ds.unit) strength, case when ds.form='T' then 'Tablets' end form, pd.created, case when df.drug_id then true end favorite
      from patient_drug pd
      join drug d on d.id=pd.drug_id
      left join client_drug df on df.client_id=${req.client_id}
          and df.drug_id=d.id
      join drug_strength ds on ds.drug_id=d.id and ds.id=pd.drug_strength_id
      where pd.user_id=${req.user_id}
      order by pd.created desc
      limit 20`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getEncountersPrescriptionsFrequencies = async (req, res) => {
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select id, descr
      from drug_frequency
      order by id
      limit 100`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getEncountersPrescriptionsStrength = async (req, res) => {
  const db = makeDb(configuration, res);
  const { drug_id } = req.params;
  try {
    const dbResponse = await db.query(
      `select id, strength, unit, form
      from drug_strength
      where drug_id=${drug_id}`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

// TODO:: inComplete code, need to pass drug_id, drug_strength_id
const encountersPrescriptionsEdit = async (req, res) => {
  const { encounter_id } = req.params;
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select d.name, concat(ds.strength, ds.unit) strength, case when ds.form='T' then 'Tablets' end form
      , df.descr, pd.start_dt, pd.expires, pd.amount, pd.refills
      , pd.generic, pd.patient_instructions, pd.pharmacy_instructions
      from patient_drug pd
      left join drug d on d.id=pd.drug_id
      left join drug_strength ds on ds.drug_id=d.id 
        and ds.id=pd.drug_strength_id left join drug_frequency df on df.id=pd.drug_frequency_id
      where pd.encounter_id=${encounter_id}
      and pd.drug_id=1
      and pd.drug_strength_id=1`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const encountersRecentProfiles = async (req, res) => {
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select d.name, concat(ds.strength, ds.unit) strength, case when ds.form='T' then 'Tablets' end form, df.descr, pd.expires, pd.amount, pd.refills, pd.generic, pd.patient_instructions, pd.pharmacy_instructions, pd.created last_used_dt, pd.count from (
        select drug_id, drug_strength_id, drug_frequency_id, expires, amount, refills, generic, patient_instructions, pharmacy_instructions, max(created) created, count(*) count
        from patient_drug pd
        where pd.client_id=1
        and pd.drug_id=1
        and pd.encounter_id<>1
        and pd.created > date_sub(now(), interval 90 day)
        group by drug_id, drug_strength_id, drug_frequency_id, expires, amount, refills, generic, patient_instructions, pharmacy_instructions
        ) pd
        left join drug d on d.id=pd.drug_id
        left join drug_strength ds on ds.drug_id=d.id 
            and ds.id=pd.drug_strength_id
        left join drug_frequency df on df.id=pd.drug_frequency_id
        order by count desc
        limit 10`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const createEncounter = async (req, res) => {
  const { patient_id } = req.params;
  const { title } = req.body.data;
  let { dt, type_id, notes, treatment, read_dt, lab_bill_to } = req.body.data;

  if (dt && typeof dt !== "undefined") {
    dt = `'${moment(dt).format("YYYY-MM-DD HH:mm:ss")}'`;
  }
  if (type_id && typeof type_id !== "undefined") {
    type_id = `'${type_id}'`;
  }
  if (notes && typeof notes !== "undefined") {
    notes = `'${notes}'`;
  }
  if (treatment && typeof treatment !== "undefined") {
    treatment = `'${treatment}'`;
  }
  if (read_dt && typeof read_dt !== "undefined") {
    read_dt = `'${moment(read_dt).format("YYYY-MM-DD HH:mm:ss")}'`;
  }
  if (lab_bill_to && typeof lab_bill_to !== "undefined") {
    lab_bill_to = `'${lab_bill_to}'`;
  }

  const db = makeDb(configuration, res);
  try {
    const insertResponse = await db.query(
      `insert into encounter (client_id, user_id, patient_id, dt, type_id, title, notes, treatment, read_dt, lab_bill_to, created, created_user_id) 
      values (${req.client_id}, ${req.user_id}, ${patient_id}, ${dt}, ${type_id}, '${title}', ${notes}, ${treatment}, ${read_dt}, ${lab_bill_to}, now(), ${req.user_id})`
    );

    if (!insertResponse.affectedRows) {
      errorMessage.message = "Insert not successful";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = insertResponse;
    successMessage.message = "Insert successful";
    return res.status(status.created).send(successMessage);
  } catch (excepErr) {
    errorMessage.message = "Insert not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const updateEncounter = async (req, res) => {
  const { patient_id, id } = req.params;
  const {
    dt,
    type_id,
    title,
    notes,
    treatment,
    read_dt,
    lab_bill_to,
  } = req.body.data;

  const db = makeDb(configuration, res);
  try {
    let $sql;

    $sql = `update encounter set title='${title}', notes='${notes}', treatment='${treatment}' `;

    if (dt && typeof dt !== "undefined") {
      $sql += `, dt='${moment(dt).format("YYYY-MM-DD HH:mm:ss")}'`;
    }
    if (type_id && typeof type_id !== "undefined") {
      $sql += `, type_id='${type_id}'`;
    }
    if (read_dt && typeof read_dt !== "undefined") {
      $sql += `, read_dt='${moment(read_dt).format("YYYY-MM-DD HH:mm:ss")}'`;
    }

    if (lab_bill_to && typeof lab_bill_to !== "undefined") {
      $sql += `, lab_bill_to=${lab_bill_to}`;
    }

    $sql += `, updated='${moment().format("YYYY-MM-DD HH:mm:ss")}',
    updated_user_id=${req.user_id}
    where patient_id=${patient_id} and id=${id}`;

    const updateResponse = await db.query($sql);
    if (!updateResponse.affectedRows) {
      errorMessage.message = "Update not successful";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = updateResponse;
    successMessage.message = "Update successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Update not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const deleteEncounter = async (req, res) => {
  const { id } = req.params;

  const db = makeDb(configuration, res);
  try {
    // Call DB query without assigning into a variable
    const deleteResponse = await db.query(`
      delete from encounter where id=${id}
    `);

    if (!deleteResponse.affectedRows) {
      errorMessage.message = "Deletion not successful";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = deleteResponse;
    successMessage.message = "Delete successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Delete not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getEncounterTypes = async (req, res) => {
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select et.id, et.name
      from encounter_type et
      where (et.client_id is null or et.client_id=1)
      order by et.sort_order
      limit 100`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getDiagnoses = async (req, res) => {
  const { encounter_id } = req.params;
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select i.name, concat('(', pi.icd_id, ' ICD-10)') id
      from patient_icd pi
      join icd i on i.id=pi.icd_id
      where pi.encounter_id=${encounter_id}
      and pi.active=true
      order by i.name
      limit 20`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getRecentDiagnoses = async (req, res) => {
  const { encounter_id } = req.params;
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select i.name, concat('(', pi.icd_id, ' ICD-10)') id
      from patient_icd pi
      join icd i on i.id=pi.icd_id
      where pi.encounter_id<>${encounter_id}
      and pi.user_id=${req.client_id}
      order by pi.created desc
      limit 20`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const searchDiagnosesICDs = async (req, res) => {
  const { text } = req.body.data;

  const db = makeDb(configuration, res);
  try {
    const $sql = `select i.id, i.name, ci.favorite
    from icd i
    left join client_icd ci on ci.client_id=${req.client_id}
        and ci.icd_id=i.id
    where i.name like '${text}%'
    order by i.name
    limit 20`;
    const dbResponse = await db.query($sql);

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Search not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const createNewPrescription = async (req, res) => {
  const { patient_id, encounter_id } = req.params;
  const {
    drug_id,
    drug_frequency_id,
    drug_strength_id,
    start_dt,
    expires,
    amount,
    refills,
    generic,
    patient_instructions,
    pharmacy_instructions,
  } = req.body.data;
  const db = makeDb(configuration, res);

  try {
    const insertResponse = await db.query(
      `insert into patient_drug (patient_id, drug_id, drug_frequency_id, drug_strength_id, start_dt, expires, amount, refills, generic,
         patient_instructions, pharmacy_instructions, encounter_id, client_id, user_id, created, created_user_id)
       values (${patient_id}, '${drug_id}', '${drug_frequency_id}', '${drug_strength_id}', '${moment(
        start_dt
      ).format("YYYY-MM-DD HH:mm:ss")}', '${expires}', '${amount}',
       '${refills}', '${generic}', '${patient_instructions}', '${pharmacy_instructions}', ${encounter_id}, ${
        req.client_id
      }, ${req.user_id}, now(), ${req.user_id})`
    );

    if (!insertResponse.affectedRows) {
      errorMessage.message = "Insert not successful";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = insertResponse;
    successMessage.message = "Insert successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Insert not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const searchDrugAndType = async (req, res) => {
  const { text } = req.body.data;

  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select d.name, concat(ds.strength, ds.unit) strength, case when ds.form='T' then 'Tablets' end form
      from drug d 
      left join drug_strength ds on ds.drug_id=d.id 
      where d.name like '${text}%'`
    );

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Search not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const searchDrug = async (req, res) => {
  const { text } = req.body.data;

  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select d.name, d.id, concat(ds.strength, ds.unit) strength
      , case when ds.form='T' then 'Tablets' end form
      , cd.favorite
      from drug d
      left join client_drug cd on cd.client_id=${req.client_id}
      and cd.drug_id=d.id
      left join drug_strength ds on ds.drug_id=d.id
      where d.name like '${text}%'
      order by d.name, ds.strength
      limit 50`
    );

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Search not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const createEncounter_ICD = async (req, res) => {
  const { patient_id, encounter_id } = req.params;
  const { icd_id } = req.body.data;
  const db = makeDb(configuration, res);
  try {
    const insertResponse = await db.query(
      `insert into patient_icd (patient_id, icd_id, active, client_id, user_id, encounter_id, created, created_user_id)
       values (${patient_id}, '${icd_id}', true, ${req.client_id}, ${req.user_id}, ${encounter_id}, now(), ${req.user_id})`
    );

    if (!insertResponse.affectedRows) {
      errorMessage.message = "Insert not successful";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = insertResponse;
    successMessage.message = "Insert successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Insert not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getEncounterPlan = async (req, res) => {
  const db = makeDb(configuration, res);
  const { encounter_id } = req.params;

  try {
    const dbResponse = await db.query(
      `select type, name, strength, unit from (
        select 1 sort, 'Rx' type, d.name, ds.strength, ds.unit
        from patient_drug pd
        left join drug d on d.id=pd.drug_id
        left join drug_strength ds on ds.id=pd.drug_strength_id
        where pd.encounter_id=${encounter_id}
        union
        select 2 sort, 'Lab' type, c.name, null, null
        from patient_cpt pc
        join cpt c on c.id=pc.cpt_id
        where pc.encounter_id=${encounter_id}
      ) d
      order by sort
      limit 50`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const searchNewPrescriptionDrug = async (req, res) => {
  const { text } = req.body.data;

  const db = makeDb(configuration, res);
  try {
    const $sql = `select d.name, concat(ds.strength, ds.unit) strength
    , case when ds.form='T' then 'Tablets' end form
    , cd.favorite
    from drug d
    left join client_drug cd on cd.client_id=${req.client_id}
        and cd.drug_id=d.id
    left join drug_strength ds on ds.drug_id=d.id
    where d.name like '${text}%'
    order by d.name, ds.strength
    limit 50`;

    const dbResponse = await db.query($sql);

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Search not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getDrugOrder = async (req, res) => {
  const { patient_id } = req.params;
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select p.id, p.firstname, p.middlename, p.lastname, p.gender, p.dob, p.ssn, p.preferred_name, p.referred_by, p.phone_home, p.phone_cell, p.phone_work, p.email
      , ph.id, ph.name, ph.address, ph.address2, ph.city, ph.state, ph.postal, ph.country, ph.phone, ph.fax
      , ph2.id, ph2.name, ph2.address, ph2.address2, ph2.city, ph2.state, ph2.postal, ph2.country, ph2.phone, ph2.fax
      from patient p
      left join pharmacy ph on ph.id=p.pharmacy_id
      left join pharmacy ph2 on ph2.id=p.pharmacy2_id
      where p.id=${patient_id}`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getDrugOrderPrescriptions = async (req, res) => {
  const { encounter_id } = req.params;
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select d.name
      , concat(ds.strength, ds.unit) strength
      , case when ds.form='T' then 'Tablets' end form
      from patient_drug pd
      join drug d on d.id=pd.drug_id
      join drug_strength ds on ds.id=pd.drug_strength_id
      where encounter_id=${encounter_id}
      order by d.name
      limit 100`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getNewLabDiagnoses = async (req, res) => {
  const { encounter_id } = req.params;
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select i.name
      from patient_icd pi
      join icd i on i.id=pi.icd_id
      left join patient_cpt_exception_icd pcei on pcei.encounter_id=pi.encounter_id
        and pcei.icd_id=pi.icd_id
      where pi.encounter_id=${encounter_id}
      and pi.active=true
      and pcei.icd_id is null
      order by i.name
      limit 100`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getOrderedTests = async (req, res) => {
  const { encounter_id } = req.params;
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select c.name, c.id
      from patient_cpt pc
      join cpt c on c.id=pc.cpt_id
      where pc.encounter_id=${encounter_id}
      order by c.name
      limit 100`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const deleteOrderedTests = async (req, res) => {
  const { encounter_id } = req.params;
  const { cpt_id } = req.body.data;
  const db = makeDb(configuration, res);
  try {
    const deleteOrderTestsResponse = await db.query(
      `delete
      from patient_cpt
      where encounter_id=${encounter_id}
      and cpt_id='${cpt_id}'`
    );

    if (!deleteOrderTestsResponse.affectedRows) {
      errorMessage.message = "Deletion not successful";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = deleteOrderTestsResponse;
    successMessage.message = "Deletion successful";
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.log("error", error);
    errorMessage.message = "Deletion not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getNewLabLaboratories = async (req, res) => {
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select id, name 
      from lab_company
      order by name
      limit 100`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getNewLabFavorites = async (req, res) => {
  const db = makeDb(configuration, res);
  const { tab } = req.query;

  try {
    let $sql;

    $sql = `select c.id, lc.name lab_name, c.name, case when cc.cpt_id<>'' then true end favorite
    from cpt c
    join client_cpt cc on cc.client_id=${req.client_id}
        and cc.cpt_id=c.id
    left join lab_company lc on lc.id=c.lab_company_id \n`;

    if (tab !== "All") {
      $sql += "where lc.id in (7,8,9) \n";
    }
    $sql += `order by lc.name, c.name limit 50`;

    const dbResponse = await db.query($sql);
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getNewLabSearch = async (req, res) => {
  const { text } = req.body.data;
  const { tab } = req.query;
  const db = makeDb(configuration, res);
  try {
    let $sql;

    $sql = `select c.id, lc.name lab_name, c.name, case when cc.cpt_id<>'' then true end favorite, group_concat(ci.cpt2_id) cpt_items
    from cpt c left join client_cpt cc on cc.client_id=${req.client_id} and cc.cpt_id=c.id
    left join lab_company lc on lc.id=c.lab_company_id
    left join cpt_item ci on ci.cpt_id=c.id
    where c.type='L' /*L=Lab*/
    and c.name like '%${text}%'`;

    if (tab !== "All") {
      $sql += `and lc.id in (7,8,9) \n`;
    }
    $sql += `group by c.id, lc.name, c.name
    order by lc.name, c.name
    limit 20`;

    const dbResponse = await db.query($sql);
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getNewLabRequestedLabs = async (req, res) => {
  const db = makeDb(configuration, res);

  try {
    const $sql = `select pc.cpt_id, c.name
    from patient_cpt pc
    join cpt c on c.id=pc.cpt_id
    where encounter_id=1
    order by c.name
    limit 100`;

    const dbResponse = await db.query($sql);
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getBilling = async (req, res) => {
  const db = makeDb(configuration, res);
  const { encounter_id } = req.params;

  try {
    const $sql = `select c.id, c.name, t.amount
    from tran t
    join cpt c on c.id=t.cpt_id
    where t.encounter_id=${encounter_id}
    order by c.name
    limit 100`;

    const dbResponse = await db.query($sql);
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getBillingDiagnoses = async (req, res) => {
  const db = makeDb(configuration, res);
  const { encounter_id } = req.params;

  try {
    const $sql = `select i.name, i.id
    from patient_icd pi
    join icd i on i.id=pi.icd_id
    where pi.encounter_id=${encounter_id}
    and pi.active=true
    order by i.name
    limit 100`;

    const dbResponse = await db.query($sql);
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getBillingProcedsures = async (req, res) => {
  const db = makeDb(configuration, res);
  const { encounter_id } = req.params;

  try {
    const $sql = `select c.id, c.name, t.amount, cc.fee
    from cpt c
    join client_cpt cc on cc.cpt_id=c.id
    left join tran t on t.encounter_id=${encounter_id} and t.cpt_id=cc.cpt_id
    where cc.client_id=1
    and cc.billable=true
    order by c.id
    limit 100`;

    const dbResponse = await db.query($sql);
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getBillingPayment = async (req, res) => {
  const db = makeDb(configuration, res);
  const { patient_id, encounter_id } = req.params;

  try {
    const $sql = `select t.dt, t.amount, t.payment_type, pm.account_number
    from tran t
    left join payment_method pm on pm.id=t.payment_method_id
    where t.patient_id=${patient_id}
    and t.encounter_id=${encounter_id}
    and t.type_id=3 /*3=Payment*/`;

    const dbResponse = await db.query($sql);
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const createBillingPayment = async (req, res) => {
  const { dt, type_id, amount } = req.body.data;
  const { encounter_id, patient_id } = req.params;
  let { payment_type } = req.body.data;

  const db = makeDb(configuration, res);

  if (!payment_type) {
    payment_type = null;
  } else {
    payment_type = `'${payment_type}'`;
  }
  try {
    const insertResponse = await db.query(
      `insert into tran (dt, type_id, payment_type, amount, encounter_id, client_id, user_id, patient_id, created, created_user_id) values 
        ('${dt}', ${type_id}, ${payment_type}, ${amount}, ${encounter_id}, ${req.client_id}, ${req.user_id}, ${patient_id}, now(), ${req.user_id})`
    );

    if (!insertResponse.affectedRows) {
      errorMessage.message = "Insert not successful";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = insertResponse;
    successMessage.message = "Insert successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.message = "Insert not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const patientEncounter = {
  getEncounters,
  getEncountersPrescriptions,
  getEncountersPrescriptionsFrequencies,
  getEncountersPrescriptionsStrength,
  encountersPrescriptionsEdit,
  encountersRecentProfiles,
  createEncounter,
  updateEncounter,
  deleteEncounter,
  getEncounterTypes,
  getDiagnoses,
  getRecentDiagnoses,
  searchDiagnosesICDs,
  searchDrugAndType,
  createNewPrescription,
  searchDrug,
  createEncounter_ICD,
  getEncounterPlan,
  searchNewPrescriptionDrug,
  getDrugOrder,
  getDrugOrderPrescriptions,
  getNewLabDiagnoses,
  getOrderedTests,
  deleteOrderedTests,
  getNewLabLaboratories,
  getNewLabFavorites,
  getNewLabSearch,
  getNewLabRequestedLabs,
  getBilling,
  getBillingDiagnoses,
  getBillingProcedsures,
  getBillingPayment,
  createBillingPayment,
};

module.exports = patientEncounter;
