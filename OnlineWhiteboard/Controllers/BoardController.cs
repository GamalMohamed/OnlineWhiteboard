using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using OnlineWhiteboard.Models;

namespace OnlineWhiteBoard.Controllers
{
    public class BoardController : Controller
    {
        [Route("Board/{id}")]
        [HttpGet]
        public ActionResult Id(string id)
        {
            ViewBag.BoardId = id;

            if (!BoardManager.BoardExists(id))
            {
                ViewBag.ErrorMessage = "No such Board exists!";

                return View("BoardError");
            }

            Board board = BoardManager.GetBoard(id);

            if (board.PasswordEnabled)
            {
                if (AuthManager.IsUserAuthenticated(Session.SessionID, id))
                {
                    return View("Board");
                }
            }
            else
            {
                return View("Board");
            }

            return new RedirectResult("/password/board/" + id);
        }

        [Route("Board/Create")]
        [HttpPost]
        public ActionResult NewBoard([Bind(Include = "Title")]BoardModel model)
        {
            if (ModelState.IsValid)
            {
                string id = BoardManager.CreateBoard(model);

                AuthManager.AuthenticateUser(Session.SessionID, id);

                return new RedirectResult("/Board/" + id);
            }

            ViewBag.ErrorMessage = "The parameters for creating the board were incorrect";

            return View("BoardError");
        }
    }
}