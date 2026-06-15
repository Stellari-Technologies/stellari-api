import { AppDataSource } from "../config/database";
import { ParticipantProfile } from "../entities/ParticipantProfile";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS, ERROR_CODES } from "../constants";

interface CreateParticipantInput {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  parentFirstName?: string;
  parentLastName?: string;
}

interface UpdateParticipantInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  parentFirstName?: string;
  parentLastName?: string;
}

export class ParticipantService {
  private repo = AppDataSource.getRepository(ParticipantProfile);

  /**
   * CREATE - Add a new participant to the org
   */
  async create(
    organizationId: string,
    data: CreateParticipantInput,
  ): Promise<ParticipantProfile> {
    const participant = this.repo.create({
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      parentFirstName: data.parentFirstName,
      parentLastName: data.parentLastName,
      pointsBalance: 0,
      organization: { id: organizationId },
    });

    return await this.repo.save(participant);
  }

  /**
   * FIND ALL - Get all participants in the org
   */
  async findAll(organizationId: string): Promise<ParticipantProfile[]> {
    return await this.repo.find({
      where: {
        organization: { id: organizationId },
      },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * FIND BY ID - Get one participant
   * Throws 404 if not found or not in this org
   */
  async findById(
    organizationId: string,
    participantId: string,
  ): Promise<ParticipantProfile> {
    const participant = await this.repo.findOne({
      where: {
        id: participantId,
        organization: { id: organizationId },
      },
    });

    if (!participant) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Participant not found",
        ERROR_CODES.NOT_FOUND,
      );
    }

    return participant;
  }

  /**
   * UPDATE - Update participant details
   * Throws 404 if not found
   */
  async update(
    organizationId: string,
    participantId: string,
    data: UpdateParticipantInput,
  ): Promise<ParticipantProfile> {
    const participant = await this.findById(organizationId, participantId);

    if (data.firstName) participant.firstName = data.firstName;
    if (data.lastName) participant.lastName = data.lastName;
    if (data.dateOfBirth) participant.dateOfBirth = new Date(data.dateOfBirth);
    if (data.parentFirstName)
      participant.parentFirstName = data.parentFirstName;
    if (data.parentLastName) participant.parentLastName = data.parentLastName;

    return await this.repo.save(participant);
  }

  /**
   * DELETE - Remove a participant from the org
   * Throws 404 if not found
   */
  async delete(organizationId: string, participantId: string): Promise<void> {
    const participant = await this.findById(organizationId, participantId);
    await this.repo.remove(participant);
  }
}
