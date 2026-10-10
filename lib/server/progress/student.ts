import "server-only";
import { db, serial, json } from "../db/client";
import { HttpError } from "../security/http";
import { PERSONAL_DOMAIN } from "../profiles/personal";
import { isPersonalRecord } from "@/lib/career/personal";
import { saveAutomaticCloudCv } from "../profiles/cv";
import {
  emptyStudentState,
  gradeStudent,
  studentEvidence,
  type StudentCommand,
  type StudentState,
} from "@/lib/student/unit";
const domain = "student-unit1";
export async function studentFor(userId: string) {
  const row = await db().cloudProgress.findUnique({
    where: { userId_domain: { userId, domain } },
  });
  return {
    data: (row?.data as StudentState | undefined) ?? emptyStudentState(),
    revision: row?.revision ?? 0,
  };
}
export async function submitStudent(userId: string, command: StudentCommand) {
  return serial(async (tx) => {
    const personal = await tx.cloudProgress.findUnique({
      where: { userId_domain: { userId, domain: PERSONAL_DOMAIN } },
    });
    if (!isPersonalRecord(personal?.data))
      throw new HttpError(409, "PERSONAL_DETAILS_REQUIRED");
    const where = { userId_domain: { userId, domain } },
      row = await tx.cloudProgress.findUnique({ where });
    if ((row?.revision ?? 0) !== command.revision)
      throw new HttpError(409, "REVISION_CONFLICT");
    let result;
    const now = new Date().toISOString();
    try {
      result = gradeStudent(
        (row?.data as StudentState | undefined) ?? emptyStudentState(),
        command,
        now,
      );
    } catch {
      throw new HttpError(409, "STEP_LOCKED");
    }
    if (result.replayed)
      return {
        data: result.state,
        revision: row?.revision ?? 0,
        correct: true,
        evidence: [],
      };
    const next = await tx.cloudProgress.upsert({
      where,
      create: {
        userId,
        domain,
        revision: 1,
        data: json(result.state),
        provenance: "SERVER",
      },
      update: {
        revision: { increment: 1 },
        data: json(result.state),
        provenance: "SERVER",
      },
    });
    const evidence = result.correct
      ? studentEvidence(userId, result.state, command.step, now)
      : [];
    for (const item of evidence)
      await tx.skillEvidenceCloud.upsert({
        where: { userId_evidenceKey: { userId, evidenceKey: item.evidenceId } },
        create: {
          userId,
          evidenceKey: item.evidenceId,
          skillId: item.skillId,
          strength: "practiced",
          source: "SERVER",
          data: json(item),
        },
        update: {},
      });
    if (result.correct) await saveAutomaticCloudCv(tx, userId);
    return {
      data: result.state,
      revision: next.revision,
      correct: result.correct,
      evidence,
    };
  });
}
