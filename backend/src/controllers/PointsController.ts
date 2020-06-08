import knex from "../database/connection";
import { Request, Response } from "express";
class PointsController {
  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query;

    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));

    const points = await knex("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .whereIn("point_items.item_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");
    const serializedPoints = points.map((point) => {
      return {
        ...points,
        image_url: `http://192.168.50.132:3333/uploads/${point.image}`,
      };
    });

    return res.json(serializedPoints);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex("points").where("id", id).first();
    const serializedPoints = {
      ...point,
      image_url: `http://192.168.50.132:3333/uploads/${point.image}`,
    };


    if (!point) {
      return res
        .status(400)
        .json({ message: "Ponto de coleta não encontrado" });
    }

    /* select * from items
       join point_items on items.id = point_items.items_id
       where point_items.point_id ={id}
     */
    const items = await knex("items")
      .join("point_items", "items.id", "=", "point_items.item_id")
      .where("point_items.point_id", id)
      .select("items.title");

    return res.json({ point:serializedPoints, items });
  }
  async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = req.body;

    const trx = await knex.transaction(); // só insere se as duas derem certo

    const points = {
      name,
      image: req.file.filename,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    const insertedIds = await trx("points").insert(points);

    const point_id = insertedIds[0];

    const pointItems = items
      .split(",")
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });

    /*  const pointItems = items.map((item_id: number) => {
      return {
        item_id,
        point_id,
      };
    }); */
    console.log("pointItems", pointItems);
    await trx("point_items").insert(pointItems);
    await trx.commit();

    return res.json({
      id: point_id,
      pointItems,
      ...points,
    });
  }
}

export default PointsController;
