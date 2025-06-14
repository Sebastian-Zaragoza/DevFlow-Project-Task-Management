import type { Request, Response } from "express";
import Task from "../models/tasks";
import User from "../models/user";
import Project from "../models/project";
import user from "../models/user";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      if (req.body.relation == "Ninguna") {
        task.relation = null;
      } else {
        const relation = await Task.findById(req.body.relation);
        if (!relation) {
          res.status(404).send("No se encontró la relación");
        }
        task.relation = relation;
      }
      const user_assigned =  await User.findOne({email: req.body.user})
      if (!user_assigned) {
        res.status(404).send("Usuario no existe")
      }
      const user_project = await Project.findOne({team: user_assigned.id});
      if (!user_project) {
        res.status(404).send("El usuario no pertenece al proyecto")
      }
      task.project = req.project.id;
      task.user = user_assigned;
      req.project.tasks.push(task.id);
      await Promise.allSettled([task.save(), req.project.save()]);
      res.send("Tarea guardada");
    } catch (error) {
      res.status(500).json({ error: "Error ocurrido" });
    }
  };
  static getTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project.id }).populate(
        "project",
      );
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Error ocurrido" });
    }
  };
  static getTaskById = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task.id).populate({path: 'completedBy.user', select: '_id name email'});
      res.send(task);
    } catch (error) {
      res.status(500).json({ error: "Error ocurrido" });
    }
  };
  static putTaskById = async (req: Request, res: Response) => {
    try {
      if (req.body.relation === "Ninguna") {
        req.body.relation = null;
      } else {
        const relation = await Task.findOne(req.body.relation);
        if (!relation) {
          res.status(404).send("No se encontró la relación");
        }
        req.body.relation = relation.id;
      }
      req.task.name = req.body.name;
      req.task.description = req.body.description;
      req.task.rol = req.body.rol;
      req.task.user = req.body.user;
      req.task.relation = req.body.relation;
      await req.task.save();
      res.send("Tarea actualizada");
    } catch (error) {
      res.status(500).json({ error: "Error ocurrido" });
    }
  };
  static deleteById = async (req: Request, res: Response) => {
    try {
      req.project.tasks = req.project.tasks.filter(
        (task) => task.toString() !== req.task.id.toString(),
      );
      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
      res.send("Tarea eliminada");
    } catch (error) {
      res.status(500).json({ error: "Error ocurrido" });
    }
  };
  static updateStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      req.task.status = status;
      const data = {
        user: req.user.id,
        status: status,
      }
      req.task.completedBy.push(data)
      await req.task.save();
      res.send("Tarea actualizada");
    } catch (error) {
      res.status(500).json({ error: "Error ocurrido" });
    }
  };
}
