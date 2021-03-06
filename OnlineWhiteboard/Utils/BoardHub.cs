﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace OnlineWhiteBoard
{
    public class BoardHub: Hub
    {
        public void AddMessage(Message message)
        {
            var context = new RequestContext(this);

            message.Sender = context.Caller.Id;
            message.SenderName = context.Caller.DisplayName;
            message.DateSent = DateTime.Now.ToUniversalTime();
            message.Text = HttpUtility.HtmlEncode(message.Text);

            context.Board.AddMessage(message);

            context.NeighborClients.addMessage(message);
        }

        public void AddTextEntity(TextEntity entity)
        {
            var context = new RequestContext(this);

            context.Board.AddEntity(entity);

            context.NeighborClients.addTextEntity(entity);
        }

        public void EntityMove(string id, Point position)
        {
            var context = new RequestContext(this);

            context.Board.SetEntityPosition(id, position);

            context.NeighborClients.entityMove(id, position);
        }

        public void TextEntityUpdateText(string id, string text)
        {
            var context = new RequestContext(this);

            context.Board.SetTextEntityText(id, text);

            context.NeighborClients.textEntityUpdateText(id, text);
        }

        public void OnDrawEvent(ClientDrawEvent e)
        {
            var context = new RequestContext(this);
            context.Board.AppendEvent(e);

            e.Sender = context.Caller.Id;

            context.NeighborClients.onDrawEvent(e);
        }

        public void OnToolChange(string toolName)
        {
            var context = new RequestContext(this);

            context.NeighborClients.onToolChange(context.Caller.Id, toolName);
        }

        public void OnClear()
        {
            var context = new RequestContext(this);

            context.Board.Clear();

            context.NeighborClients.onClear(context.Caller.Id);
        }

        public void Handshake(string boardId)
        {
            // Apparently, this can be true if you click "back" from a different page, and this board
            // has already been deleted. In that case, the HTML is loaded from the cache, so there are
            // no server-side checks for board existence until the handshake, which is where problems start.
            if (!BoardManager.BoardExists(boardId))
            {
                // TODO: implement a redirecting mechanism to a "this board doesn't exist" page or something.
                return;
            }

            string sessionId = Context.RequestCookies["ASP.NET_SessionId"].Value;

            var user = UserManager.GetUserBySession(sessionId);

            if (user != null)
            {
                user.AddConnection(Context.ConnectionId);

                user.TrySetBoard(boardId);

                FinalizeHandshake(boardId, user);

                return;
            }

            var newUser = new User(Context.ConnectionId, boardId, sessionId);

            UserManager.AddUser(newUser);

            FinalizeHandshake(boardId, newUser);
        }

        private void FinalizeHandshake(string boardId, User user)
        {
            var context = new RequestContext(this);
            var actions = context.Board.Events;

            var snapshot = new BoardSnapshot(context.Board);

            Clients.Caller.handshake(context.Caller, snapshot);

            context.NeighborClients.connect(user);

            if (BoardManager.IsBoardScheduledForDeletion(boardId))
            {
                BoardManager.CancelBoardDeletion(boardId);
            }
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            RequestContext context;

            try
            {
                context = new RequestContext(this);
            }
            catch (Exception)
            {
                return base.OnDisconnected(stopCalled);
            }

            context.Caller.RemoveConnection(Context.ConnectionId);

            context.NeighborClients.disconnect(context.Caller);

            if (context.Board.IsEmpty)
            {
                BoardManager.ScheduleBoardDeletion(TimeSpan.FromMinutes(5), context.Board.Id);
            }

            return base.OnDisconnected(stopCalled);
        }

        public void ChangeName(string newName)
        {
            var context = new RequestContext(this);

            context.NeighborClients.onNameChange(context.Caller.DisplayName, newName);

            context.Caller.DisplayName = newName;
        }
    }
}