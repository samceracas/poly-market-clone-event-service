import amqp, { type Channel, type ChannelModel } from "amqplib";
import { EVENT_EXCHANGE } from "./constants.ts";

let connection: ChannelModel | null = null;
let publishChannel: Channel | null = null;

export const connect = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL!);
    publishChannel = await connection.createChannel();

    await publishChannel.assertExchange(EVENT_EXCHANGE, "topic", {
      durable: true,
    });

    connection.on("close", () => {
      console.error("RabbitMQ connection closed, reconnecting...");

      // The connection (and any channel on it) is already dead at this
      // point - don't call channel.close(), it throws because the broker
      // already tore it down. Just drop the references and reconnect.
      connection = null;
      publishChannel = null;
      setTimeout(connect, 5000);
    });

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err);
    });

    console.log("RabbitMQ connected");
  } catch (err) {
    // Covers both the initial connect and every retry: if the broker is
    // unreachable, don't let the rejection escape unhandled (that crashes
    // the process) - log and try again.
    console.error("Failed to connect to RabbitMQ, retrying in 5s:", err);
    setTimeout(connect, 5000);
  }
};

export const getPublishChannel = () => {
  if (!publishChannel) throw new Error("Publish channel not initialized");

  return publishChannel;
};
