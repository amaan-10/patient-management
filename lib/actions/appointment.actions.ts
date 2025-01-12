"use server"
import { ID, Query } from "node-appwrite"
import { APPOINTMENT_COLLECTION_ID,  DATABASE_ID, databases, messaging} from "../appwrite.config"
import { formatDateTime, parseStringify } from "../utils"
import { Appointment } from "@/types/appwrite.types"
import { revalidatePath } from "next/cache"

export const createAppointment = async (appointment: CreateAppointmentParams) => {
    try {
        const newAppointment = await databases.createDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            ID.unique(),
            appointment
        )

        if(!newAppointment) {
          throw new Error("Appointment not found")
      }

      const emailMessage = `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #f8fafc; ">
                    <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 18px; background-color: #131619; padding: 42px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                          <img src="https://curalink-appointments.vercel.app/assets/icons/logo-full.png" alt="CuraLink Logo" style="max-width: 200px; height:auto;">
                        </div>
                        <h2 style="text-align: center; color: #24ae76;">Appointment Request Received</h2>
                        <p>Dear <strong>Patient</strong>,</p>
                        <p>We are pleased to inform you that your appointment request with 
                        <strong>Dr. ${appointment.primaryPhysician}</strong> has been successfully received.</p>
                        <p><strong>Requested Appointment Details:</strong></p>
                        <ul style="list-style-type: none; padding: 0;">
                            <li><strong>Date:</strong> ${formatDateTime(appointment.schedule!).dateOnly}</li>
                            <li><strong>Time:</strong> ${formatDateTime(appointment.schedule!).timeOnly}</li>
                        </ul>
                        <p>Please note that this is a request, and the appointment is not yet confirmed. You will receive a confirmation email later today to finalize the appointment details.</p>
                        <p style="margin: 20px 0;">
                            If you have any questions or need further assistance, feel free to contact us at 
                            <a href="mailto:workwithamaan.dev@gmail.com">workwithamaan.dev@gmail.com</a> or call us at <strong>(123) 456-7890</strong>.
                        </p>
                        <p>Thank you for choosing CuraLink. We look forward to serving you!</p>
                        <p style="text-align: center; margin-top: 30px; color: #76828d; font-size: 12px;">
                            This is an automated message. Please do not reply to this email.
                        </p>
                    </div>
                </body>
                </html>
            `
            const smsMessage = ` \n\nDear Patient,\nHello from CuraLink!\nYour appointment request with Dr. ${appointment.primaryPhysician} for ${formatDateTime(appointment.schedule!).dateOnly} at ${formatDateTime(appointment.schedule!).timeOnly} has been received successfully.\nPlease note, this is a request and not yet confirmed. You will receive a confirmation SMS later today.\n\nThank you for choosing CuraLink.`

      await sendSMSNotification(appointment.userId, smsMessage)
      await sendEmailNotification(appointment.userId, emailMessage, 'Thank you for Scheduling an Appointment')

        return parseStringify(newAppointment)
    } catch (error) {
        console.log(error)
    }
}

export const getAppointment = async (appointmentId: string) => {
    try {
        const appointment = await databases.getDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            appointmentId,
        )

        return parseStringify(appointment)
    } catch (error) {
        console.log(error)
    }
}

export const getRecentAppointmentList = async () => {
    try {
      const appointments = await databases.listDocuments(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        [Query.orderDesc("$createdAt")]
      );
      //   appointments.documents as Appointment[]
      // ).filter((appointment) => appointment.status === "scheduled");
  
      // const pendingAppointments = (
      //   appointments.documents as Appointment[]
      // ).filter((appointment) => appointment.status === "pending");
  
      // const cancelledAppointments = (
      //   appointments.documents as Appointment[]
      // ).filter((appointment) => appointment.status === "cancelled");
  
      // const data = {
      //   totalCount: appointments.total,
      //   scheduledCount: scheduledAppointments.length,
      //   pendingCount: pendingAppointments.length,
      //   cancelledCount: cancelledAppointments.length,
      //   documents: appointments.documents,
      // };
  
      const initialCounts = {
        scheduledCount: 0,
        pendingCount: 0,
        cancelledCount: 0,
      };
  
      const counts = (appointments.documents as Appointment[]).reduce(
        (acc, appointment) => {
          switch (appointment.status) {
            case "scheduled":
              acc.scheduledCount++;
              break;
            case "pending":
              acc.pendingCount++;
              break;
            case "cancelled":
              acc.cancelledCount++;
              break;
          }
          return acc;
        },
        initialCounts
      );
  
      const data = {
        totalCount: appointments.total,
        ...counts,
        documents: appointments.documents,
      };
  
      return parseStringify(data);
    } catch (error) {
      console.error(
        "An error occurred while retrieving the recent appointments:",
        error
      );
    }
  };

export const updateAppointment = async ({appointmentId, userId, appointment, type}: UpdateAppointmentParams) => {
    try {
        const updatedAppointment = await databases.updateDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            appointmentId,
            appointment
        )

        if(!updatedAppointment) {
            throw new Error("Appointment not found")
        }

        const smsMessage = `Hello from CuraLink. \n${type === 'schedule' ? `Your appointment has been scheduled for ${formatDateTime(appointment.schedule!).dateTime} with Dr. ${appointment.primaryPhysician}.\nPlease arrive 10-15 minutes early.\nIf you need to reschedule, contact us at workwithamaan.dev@gmail.com or (123) 456-7890.\nThank you, CuraLink.` : `We regret to inform you that your appointment has been cancelled for the following reason: ${appointment.cancellationReason}`}.\nFor rescheduling or inquiries, please contact workwithamaan.dev@gmail.com or (123) 456-7890.\nWe apologize for any inconvenience caused.\nThank you, CuraLink.`

        const emailMessage = `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #f8fafc; ">
                    <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 18px; background-color: #131619; padding: 42px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                          <img src="https://curalink-appointments.vercel.app/assets/icons/logo-full.png" alt="CuraLink Logo" style="max-width: 200px; height:auto;">
                        </div>
                        ${type === 'schedule' ? `
                        <h2 style="text-align: center; color: #4CAF50;">Appointment Confirmation</h2>
                        <p>Dear <strong>Patient</strong>,</p>
                        
                        <p>
                          We are happy to confirm your appointment with <strong>Dr. ${appointment.primaryPhysician}</strong>.
                          The details of your appointment are as follows:
                        </p>

                        <p><strong>Appointment Details:</strong></p>
                        <ul style="list-style-type: none; padding: 0;">
                          <li><strong>Date:</strong> ${formatDateTime(appointment.schedule!).dateOnly}</li>
                          <li><strong>Time:</strong> ${formatDateTime(appointment.schedule!).timeOnly}</li>
                        </ul>
                        
                        <p>
                          Please arrive 10-15 minutes early for your appointment. If you need to reschedule or have any questions, feel free to contact us at <a href="mailto:workwithamaan.dev@gmail.com">workwithamaan.dev@gmail.com</a> or call us at <strong>(123) 456-7890</strong>.
                        </p>

                        <p>Thank you for choosing CuraLink. We look forward to seeing you!</p>
                        ` : ` 
                          <h2 style="text-align: center; color: #ff4d4d;">Appointment Cancellation</h2>
      
                          <p>Dear <strong>Patient</strong>,</p>
                          
                          <p>
                            We regret to inform you that your appointment with <strong>Dr. ${appointment.primaryPhysician}</strong> scheduled for 
                            <strong>${formatDateTime(appointment.schedule!).dateOnly}</strong> at <strong>${formatDateTime(appointment.schedule!).timeOnly}</strong> has been cancelled due to following reason:- <br/>
                            <strong>"${appointment.cancellationReason}"</strong>
                          </p>

                          <p>
                            We sincerely apologize for any inconvenience this may cause. If you would like to reschedule your appointment or need assistance, please contact us at <a href="mailto:support@curalink.com">support@curalink.com</a> or call us at <strong>(123) 456-7890</strong>.
                          </p>

                          <p>
                            We are committed to providing you with the best care and will do our best to accommodate you at your earliest convenience.
                          </p>

                          <p>Thank you for your understanding, and we hope to serve you soon.</p>
                          `}
                        
                        <p style="text-align: center; margin-top: 30px; color: #888; font-size: 12px;">
                          This is an automated message. Please do not reply to this email.
                        </p>
                      </div>
                    </body>
                  </html>`

        await sendSMSNotification(userId, smsMessage)
        await sendEmailNotification(userId, emailMessage, type === 'schedule' ? 'Confirmation: Your Appointment has Scheduled' : 'Apologies: Your Appointment has been Cancelled')

        revalidatePath('/admin/dashboard')
        return parseStringify(updatedAppointment)
    } catch (error) {
        console.log(error)
    }
}

export const sendSMSNotification = async (userId: string, content: string) => {
    try {
        const message = await messaging.createSms(
          ID.unique(),
          content,
          [],
          [userId]
        )
        return parseStringify(message)
    } catch (error) {
        console.log(error)
    }
}

export const sendEmailNotification = async (userId: string, content: string, subject: string) => {
  try {
      const email = await messaging.createEmail(
        ID.unique(),
        subject,
        content,
        [],
        [userId]
      )
      return parseStringify(email)
  } catch (error) {
      console.log(error)
  }
}