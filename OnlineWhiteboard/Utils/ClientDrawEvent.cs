﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace OnlineWhiteBoard
{
    [DataContract]
    public class ClientDrawEvent
    {
        [DataMember(Name = "id")]
        public string Sender { get; set; }

        [DataMember(Name = "point")]
        public Point Point { get; private set; }

        [DataMember(Name = "lastPoint")]
        public Point LastPoint { get; private set; }

        [DataMember(Name = "type")]
        public int EventType { get; private set; }

        [DataMember(Name = "toolBehaviorName")]
        public string ToolBehaviorName { get; private set; }

        [DataMember(Name = "color")]
        public string Color { get; private set; }

        [DataMember(Name = "thickness")]
        public int Thickness { get; private set; }
    }
}